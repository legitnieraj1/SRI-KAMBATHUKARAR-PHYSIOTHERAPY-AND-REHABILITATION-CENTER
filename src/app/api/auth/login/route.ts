import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err } from '@/lib/api-helpers';
import { signToken, setAuthCookie, comparePassword } from '@/lib/auth';
import { loginSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { phone, password } = parsed.data;

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('phone', phone)
    .in('role', ['DOCTOR', 'SUPER_ADMIN'])
    .single();

  if (!user) return err('Invalid credentials', 401);

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) return err('Invalid credentials', 401);

  const token = signToken({ userId: user.id, role: user.role, phone: user.phone });
  const cookie = setAuthCookie(token);

  return new Response(
    JSON.stringify({ success: true, data: { user: { id: user.id, name: user.name, phone: user.phone, role: user.role } } }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie } }
  );
}
