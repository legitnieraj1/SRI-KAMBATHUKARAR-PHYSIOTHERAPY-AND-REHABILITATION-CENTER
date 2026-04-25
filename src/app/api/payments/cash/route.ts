import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import { cashLogSchema } from '@/lib/validators';
import type { AuthPayload } from '@/types';

export async function POST(req: NextRequest) {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  const body = await req.json().catch(() => null);
  const parsed = cashLogSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { booking_id, amount } = parsed.data;

  const { data: booking } = await supabaseAdmin
    .from('bookings').select('id, status').eq('id', booking_id).single();
  if (!booking) return err('Booking not found', 404);

  const { data: payment, error } = await supabaseAdmin
    .from('payments')
    .insert({
      booking_id,
      amount,
      method: 'CASH',
      status: 'PAID',
      processed_at: new Date().toISOString(),
      cash_logged_by: user.userId,
    })
    .select()
    .single();

  if (error) return err('Failed to record payment', 500);

  await supabaseAdmin.from('bookings').update({ status: 'CONFIRMED' }).eq('id', booking_id);

  return ok(payment, 201);
}

export async function GET() {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;

  const { data, error } = await supabaseAdmin
    .from('payments')
    .select(`
      id, amount, method, status, processed_at,
      bookings!inner(
        id, package_type, amount,
        patients!inner(id, users!inner(id, name, phone))
      )
    `)
    .eq('method', 'CASH')
    .order('processed_at', { ascending: false });

  if (error) return err('Failed to fetch cash payments', 500);
  return ok(data);
}
