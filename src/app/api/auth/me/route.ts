import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import type { AuthPayload } from '@/types';

export async function GET() {
  const result = await requireAuth();
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  const { data } = await supabaseAdmin
    .from('users')
    .select('id, name, phone, role, created_at')
    .eq('id', user.userId)
    .single();

  if (!data) return err('User not found', 404);
  return ok(data);
}
