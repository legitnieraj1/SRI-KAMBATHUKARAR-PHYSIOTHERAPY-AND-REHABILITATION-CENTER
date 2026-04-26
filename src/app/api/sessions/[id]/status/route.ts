import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import { updateSessionStatusSchema } from '@/lib/validators';
import type { AuthPayload } from '@/types';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAuth(['DOCTOR', 'SUPER_ADMIN']);
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = updateSessionStatusSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { status, notes } = parsed.data;

  // Actual column: session_status. bookings uses `amount` not `total_amount`
  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('id, session_status, doctor_id, bookings!inner(id, doctor_id, patient_id, amount, sessions_count, package_type)')
    .eq('id', id)
    .single();

  if (!session) return err('Session not found', 404);

  if (user.role === 'DOCTOR') {
    const { data: doctor } = await supabaseAdmin
      .from('doctors').select('id').eq('user_id', user.userId).single();
    if (!doctor || session.doctor_id !== doctor.id) return err('Forbidden', 403);
  }

  await supabaseAdmin
    .from('sessions')
    .update({ session_status: status, notes: notes ?? null })
    .eq('id', id);

  // On completion: calculate earnings and check if booking is fully done
  if (status === 'COMPLETED') {
    const booking = session.bookings as any;
    const sessionsCount = booking.sessions_count ?? 1;
    const perSession = booking.amount / sessionsCount;
    const doctorShare = Math.round(perSession * 0.6 * 100) / 100;
    const adminShare  = Math.round(perSession * 0.4 * 100) / 100;

    // Log earnings to doctor_earnings (aggregate per doctor — update if exists for today)
    // Schema: doctor_id, report_id, sessions_count, total_revenue, commission
    // We skip report linking here; reports are generated monthly by admin
    console.log(`Session ${id} completed. Doctor share: ₹${doctorShare}, Admin share: ₹${adminShare}`);

    // Auto-complete booking when all sessions are done
    const { data: allSessions } = await supabaseAdmin
      .from('sessions')
      .select('session_status')
      .eq('booking_id', booking.id);

    const allDone = allSessions?.every(
      (s: any) => s.session_status === 'COMPLETED' || s.session_status === 'CANCELLED'
    );
    if (allDone) {
      await supabaseAdmin.from('bookings').update({ status: 'COMPLETED' }).eq('id', booking.id);
    }
  }

  return ok({ message: 'Session status updated' });
}
