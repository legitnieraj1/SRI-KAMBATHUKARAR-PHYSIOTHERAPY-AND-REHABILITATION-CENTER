import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err } from '@/lib/api-helpers';

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
