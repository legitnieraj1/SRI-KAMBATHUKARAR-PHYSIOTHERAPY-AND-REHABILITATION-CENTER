import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAuth();
  if (result instanceof Response) return result;

  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      id, package_type, visit_type, start_date, scheduled_time, status, amount, notes, sessions_count, created_at,
      doctors!inner(id, specialization, users!inner(id, name, phone)),
      patients!inner(id, users!inner(id, name, phone)),
      sessions(id, scheduled_date, session_number, session_status, notes),
      payments(id, amount, method, status, processed_at)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return err('Booking not found', 404);
  return ok(data);
}
