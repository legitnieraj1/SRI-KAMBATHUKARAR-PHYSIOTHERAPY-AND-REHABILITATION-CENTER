import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';

export async function GET() {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;

  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 7) + '-01';

  const [
    totalPatientsRes,
    totalDoctorsRes,
    monthlyPaymentsRes,
    todaySessionsRes,
    pendingBookingsRes,
    recentBookingsRes,
  ] = await Promise.all([
    supabaseAdmin.from('patients').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('doctors').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin
      .from('payments')
      .select('amount')
      .eq('status', 'PAID')
      .gte('processed_at', `${monthStart}T00:00:00`),
    supabaseAdmin
      .from('sessions')
      .select('id, session_status')
      .eq('scheduled_date', today),
    supabaseAdmin
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'PENDING'),
    supabaseAdmin
      .from('bookings')
      .select(`
        id, package_type, visit_type, start_date, status, amount, created_at,
        doctors!inner(id, users!inner(id, name)),
        patients!inner(id, users!inner(id, name, phone))
      `)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const monthlyRevenue = (monthlyPaymentsRes.data ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
  const todaySessions = todaySessionsRes.data ?? [];

  return ok({
    stats: {
      total_patients: totalPatientsRes.count ?? 0,
      active_doctors: totalDoctorsRes.count ?? 0,
      monthly_revenue: monthlyRevenue,
      admin_earnings: monthlyRevenue * 0.4,
      today_sessions: todaySessions.length,
      today_completed: todaySessions.filter((s) => s.session_status === 'COMPLETED').length,
      pending_bookings: pendingBookingsRes.count ?? 0,
    },
    recent_bookings: recentBookingsRes.data ?? [],
  });
}
