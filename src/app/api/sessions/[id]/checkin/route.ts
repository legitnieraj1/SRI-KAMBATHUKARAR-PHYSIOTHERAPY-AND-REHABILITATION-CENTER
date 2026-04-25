import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import { checkinSchema } from '@/lib/validators';
import type { AuthPayload } from '@/types';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAuth(['DOCTOR', 'SUPER_ADMIN']);
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { attendance_status } = parsed.data;

  // Verify session exists
  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('id, session_status, doctor_id, patient_id')
    .eq('id', id)
    .single();

  if (!session) return err('Session not found', 404);

  if (session.session_status === 'COMPLETED' || session.session_status === 'CANCELLED') {
    return err('Session is already finalised', 400);
  }

  if (user.role === 'DOCTOR') {
    const { data: doctor } = await supabaseAdmin
      .from('doctors').select('id').eq('user_id', user.userId).single();
    if (!doctor || session.doctor_id !== doctor.id) return err('Forbidden', 403);
  }

  // Upsert attendance record
  const { data: existing } = await supabaseAdmin
    .from('attendance')
    .select('id')
    .eq('session_id', id)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from('attendance')
      .update({ status: attendance_status, marked_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabaseAdmin.from('attendance').insert({
      session_id: id,
      doctor_id: session.doctor_id,
      patient_id: session.patient_id,
      status: attendance_status,
      marked_at: new Date().toISOString(),
    });
  }

  // Update session to IN_PROGRESS
  await supabaseAdmin
    .from('sessions')
    .update({ session_status: 'IN_PROGRESS', actual_checkin_time: new Date().toISOString() })
    .eq('id', id);

  return ok({ message: 'Check-in recorded' });
}
