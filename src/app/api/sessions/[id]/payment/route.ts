import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import { recordPaymentSchema } from '@/lib/validators';
import { sendPushToUsers } from '@/lib/push';
import { after } from 'next/server';
import type { AuthPayload } from '@/types';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAuth(['DOCTOR', 'SUPER_ADMIN']);
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = recordPaymentSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { method } = parsed.data;

  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('id, session_status, doctor_id, bookings!inner(id, amount, sessions_count, patient_id)')
    .eq('id', id)
    .single();

  if (!session) return err('Session not found', 404);
  if ((session as any).session_status === 'CANCELLED') return err('Cannot record payment for cancelled session', 400);

  if (user.role === 'DOCTOR') {
    const { data: doctor } = await supabaseAdmin
      .from('doctors').select('id').eq('user_id', user.userId).single();
    if (!doctor || (session as any).doctor_id !== doctor.id) return err('Forbidden', 403);
  }

  const now = new Date().toISOString();

  await supabaseAdmin
    .from('sessions')
    .update({
      session_status: 'COMPLETED',
      payment_method: method,
      payment_status: 'RECEIVED',
      payment_received_at: now,
    })
    .eq('id', id);

  const booking = (session as any).bookings;
  const sessionsCount = booking?.sessions_count ?? 1;
  const perSession = (booking?.amount ?? 0) / sessionsCount;
  const doctorShare = Math.round(perSession * 0.6 * 100) / 100;
  const adminShare  = Math.round(perSession * 0.4 * 100) / 100;
  console.log(`Payment received for session ${id}. Method: ${method}. Doctor: ₹${doctorShare}, Admin: ₹${adminShare}`);

  const { data: allSessions } = await supabaseAdmin
    .from('sessions').select('session_status').eq('booking_id', booking.id);
  const allDone = allSessions?.every(
    (s: any) => s.session_status === 'COMPLETED' || s.session_status === 'CANCELLED'
  );
  if (allDone) {
    await supabaseAdmin.from('bookings').update({ status: 'COMPLETED' }).eq('id', booking.id);
  }

  after(async () => {
    try {
      const { data: admins } = await supabaseAdmin
        .from('users').select('id').eq('role', 'SUPER_ADMIN');
      if (admins?.length) {
        await sendPushToUsers(admins.map((a: any) => a.id), {
          title: `Payment Received — ₹${perSession}`,
          body: `Session ${id.slice(0, 8)} · ${method} · Dr share ₹${doctorShare} · Admin ₹${adminShare}`,
          url: '/admin/dashboard',
          tag: `payment-${id}`,
        });
      }
    } catch { /* non-critical */ }
  });

  return ok({ method, amount: perSession, doctor_share: doctorShare, admin_share: adminShare });
}
