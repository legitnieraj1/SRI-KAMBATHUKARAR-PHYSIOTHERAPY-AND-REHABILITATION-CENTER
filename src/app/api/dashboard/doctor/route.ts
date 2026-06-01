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

  const [todaySessionsRes, earningsRes, liveSessionsRes] = await Promise.all([
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
      .select('commission, sessions_count, total_revenue, monthly_reports(month)')
      .eq('doctor_id', doctor.id),
    // Live: all completed sessions for this doctor (not yet in locked reports)
    supabaseAdmin
      .from('sessions')
      .select('bookings!inner(amount, sessions_count)')
      .eq('doctor_id', doctor.id)
      .eq('session_status', 'COMPLETED'),
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

  // Live totals from completed sessions (source of truth until monthly reports locked)
  const liveSessions = liveSessionsRes.data ?? [];
  const liveRevenue = liveSessions.reduce((sum: number, s: any) => {
    const perSession = (s.bookings?.amount ?? 0) / (s.bookings?.sessions_count ?? 1);
    return sum + perSession;
  }, 0);
  const totalCommission = Math.round(liveRevenue * 0.6 * 100) / 100;
  const totalRevenue    = Math.round(liveRevenue * 100) / 100;
  const totalSessions   = liveSessions.length;

  const earningsData = earningsRes.data ?? [];
  const monthly = earningsData.map((e: any) => ({
    month: e.monthly_reports?.month?.slice(0, 7) ?? '',
    sessions_count: e.sessions_count ?? 0,
    total_revenue: e.total_revenue ?? 0,
    doctor_share: e.commission ?? 0,
  })).filter((e: any) => e.month);

  return ok({
    today: {
      date: today,
      sessions,
      total: sessions.length,
      completed: sessions.filter((s: any) => s.session_status === 'COMPLETED').length,
    },
    earnings: {
      total_commission: totalCommission,
      total_revenue: totalRevenue,
      total_sessions: totalSessions,
      monthly,
    },
  });
}
