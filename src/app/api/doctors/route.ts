import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import { hashPassword } from '@/lib/auth';
import { createDoctorSchema } from '@/lib/validators';
import type { AuthPayload } from '@/types';

export async function GET(req: NextRequest) {
  const showAll = req.nextUrl.searchParams.get('all') === 'true';

  // Only SUPER_ADMIN can see all (including inactive) doctors
  if (showAll) {
    const authResult = await requireAuth(['SUPER_ADMIN']);
    if (authResult instanceof Response) return authResult;
  }

  let query = supabaseAdmin
    .from('doctors')
    .select(`
      id,
      specialization,
      license_number,
      is_active,
      availability_start,
      availability_end,
      users!inner(id, name, phone, email)
    `)
    .order('is_active', { ascending: false });

  if (!showAll) query = query.eq('is_active', true);

  const { data, error } = await query;
  if (error) return err('Failed to fetch doctors', 500);
  return ok(data);
}

export async function POST(req: NextRequest) {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;
  const authUser = result as AuthPayload;
  void authUser;

  const body = await req.json().catch(() => null);
  const parsed = createDoctorSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { phone, name, password, specialization, license_number, email } = parsed.data;

  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('phone', phone)
    .single();

  if (existing) return err('A user with this phone already exists', 409);

  const passwordHash = await hashPassword(password);

  const { data: newUser, error: userError } = await supabaseAdmin
    .from('users')
    .insert({ phone, name, role: 'DOCTOR', password_hash: passwordHash, email })
    .select()
    .single();

  if (userError || !newUser) return err('Failed to create doctor account', 500);

  const { data: doctor, error: docError } = await supabaseAdmin
    .from('doctors')
    .insert({ user_id: newUser.id, specialization, license_number })
    .select()
    .single();

  if (docError) {
    await supabaseAdmin.from('users').delete().eq('id', newUser.id);
    return err('Failed to create doctor profile', 500);
  }

  return ok({ user: { id: newUser.id, name, phone, role: 'DOCTOR' }, doctor }, 201);
}
