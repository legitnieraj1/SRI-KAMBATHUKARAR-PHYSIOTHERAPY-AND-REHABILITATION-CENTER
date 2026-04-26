import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import { updateDoctorSchema } from '@/lib/validators';
import { hashPassword } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('doctors')
    .select(`
      id,
      specialization,
      license_number,
      is_active,
      users!inner(id, name, phone, email)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return err('Doctor not found', 404);
  return ok(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = updateDoctorSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { name, phone, email, password, specialization, license_number, is_active } = parsed.data;

  // Get doctor's user_id
  const { data: doctor } = await supabaseAdmin
    .from('doctors').select('id, user_id').eq('id', id).single();
  if (!doctor) return err('Doctor not found', 404);

  // Update users table (name, phone, email, password)
  const userUpdates: Record<string, unknown> = {};
  if (name !== undefined) userUpdates.name = name;
  if (phone !== undefined) userUpdates.phone = phone;
  if (email !== undefined) userUpdates.email = email;
  if (password) userUpdates.password_hash = await hashPassword(password);

  if (Object.keys(userUpdates).length > 0) {
    const { error: userErr } = await supabaseAdmin
      .from('users').update(userUpdates).eq('id', doctor.user_id);
    if (userErr) return err('Failed to update user info: ' + userErr.message, 500);
  }

  // Update doctors table (specialization, license_number, is_active)
  const docUpdates: Record<string, unknown> = {};
  if (specialization !== undefined) docUpdates.specialization = specialization;
  if (license_number !== undefined) docUpdates.license_number = license_number;
  if (is_active !== undefined) docUpdates.is_active = is_active;

  if (Object.keys(docUpdates).length > 0) {
    const { error: docErr } = await supabaseAdmin
      .from('doctors').update(docUpdates).eq('id', id);
    if (docErr) return err('Failed to update doctor info: ' + docErr.message, 500);
  }

  // Return updated doctor
  const { data: updated } = await supabaseAdmin
    .from('doctors')
    .select('id, specialization, license_number, is_active, users!inner(id, name, phone, email)')
    .eq('id', id)
    .single();

  return ok(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('doctors').update({ is_active: false }).eq('id', id);

  if (error) return err('Failed to deactivate doctor', 500);
  return ok({ message: 'Doctor deactivated successfully' });
}
