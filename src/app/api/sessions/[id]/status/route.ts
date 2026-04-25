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

  const { status } = parsed.data;

  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('id, session_status, doctor_id, booking_id, bookings!inner(id, doctor_id, patient_id, amount, sessions_count, package_type)')
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
    .update({ session_status: status })
    .eq('id', id);

  // When completing a session, mark booking COMPLETED if all sessions done
  if (status === 'COMPLETED') {
    const booking = session.bookings as any;

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
