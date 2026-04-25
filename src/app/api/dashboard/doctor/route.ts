import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import type { AuthPayload } from '@/types';

export async function GET() {
  const result = await requireAuth(['DOCTOR', 'SUPER_ADMIN']);
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  const { data: doctor } = await supabaseAdmin
    .from('doctors').select('id').eq('user_id', user.userId).single();

  if (!doctor) return err('Doctor profile not found', 404);

  const today = new Date().toISOString().split('T')[0];

  const [todaySessionsRes, earningsRes] = await Promise.all([
    supabaseAdmin
      .from('sessions')
      .select(`
        id, scheduled_date, scheduled_time, session_number, session_status,
        bookings!inner(id, package_type, visit_type),
        patients!inner(id, users!inner(id, name, phone)),
        attendance(id, status),
        photos(id)
      `)
      .eq('doctor_id', doctor.id)
      .eq('scheduled_date', today)
      .order('scheduled_time', { ascending: true }),
    supabaseAdmin
      .from('doctor_earnings')
      .select('commission, sessions_count, total_revenue')
      .eq('doctor_id', doctor.id),
  ]);

  const sessions = (todaySessionsRes.data ?? []).map((s: any) => ({
    ...s,
    session_date: s.scheduled_date,
    status: s.session_status,
    bookings: {
      ...s.bookings,
      scheduled_time: s.scheduled_time,
      patients: s.patients,
    },
    attendance: s.attendance?.map((a: any) => ({ attendance_status: a.status })) ?? [],
    photos: s.photos ?? [],
  }));

  const totalCommission = (earningsRes.data ?? []).reduce((s, e) => s + (e.commission ?? 0), 0);

  return ok({
    today: {
      date: today,
      sessions,
      total: sessions.length,
      completed: sessions.filter((s: any) => s.session_status === 'COMPLETED').length,
    },
    earnings: {
      total_commission: totalCommission,
    },
  });
}
