import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import { updateSettingSchema } from '@/lib/validators';

export async function GET() {
  const result = await requireAuth();
  if (result instanceof Response) return result;

  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('key, value, updated_at');

  if (error) return err('Failed to fetch settings', 500);

  const map: Record<string, string> = {};
  for (const row of data ?? []) map[(row as any).key] = (row as any).value;
  return ok(map);
}

export async function PUT(req: NextRequest) {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;

  const body = await req.json().catch(() => null);
  const parsed = updateSettingSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { key, value } = parsed.data;
  const { error } = await supabaseAdmin
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) return err('Failed to update setting', 500);
  return ok({ key, value });
}
