import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, requireAuth } from '@/lib/api-helpers';

export async function GET() {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;

  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 7) + '-01';

  const [
    totalPatientsRes,
    totalDoctorsRes,
    monthlyBookingsRes,   // revenue from confirmed/completed bookings this month
    collectedPaymentsRes, // cash actually logged as paid
    todaySessionsRes,
    pendingBookingsRes,
    recentBookingsRes,
  ] = await Promise.all([
    supabaseAdmin.from('patients').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('doctors').select('id', { count: 'exact', head: true }).eq('is_active', true),

    // Total booking value this month (all non-cancelled) — shows projected revenue
    supabaseAdmin
      .from('bookings')
      .select('amount')
      .gte('start_date', monthStart)
      .neq('status', 'CANCELLED'),

    // Cash actually collected this month via payment log
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

    // Fix: bookings.patient_id → users.id (not patients.id)
    supabaseAdmin
      .from('bookings')
      .select(`
        id, package_type, visit_type, start_date, scheduled_time, status, amount, created_at,
        doctors!inner(id, users!inner(id, name)),
        users!bookings_patient_id_fkey(id, name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const monthlyRevenue  = (monthlyBookingsRes.data ?? []).reduce((s, b) => s + (b.amount ?? 0), 0);
  const collectedAmount = (collectedPaymentsRes.data ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
  const todaySessions   = todaySessionsRes.data ?? [];

  // Normalise recent bookings so the frontend can access .patients.users.name
  const recentBookings = (recentBookingsRes.data ?? []).map((b: any) => {
    const patientUser = b['users!bookings_patient_id_fkey'] ?? b['users'] ?? {};
    return {
      id:           b.id,
      package_type: b.package_type,
      visit_type:   b.visit_type,
      start_date:      b.start_date,
      scheduled_time:  (() => { const t: string = b.scheduled_time ?? ''; return t.length > 5 ? t.slice(0, 5) : t; })(),
      status:       b.status,
      total_amount: b.amount,       // frontend reads b.total_amount
      created_at:   b.created_at,
      doctors:      b.doctors,      // already correct shape
      patients: {
        users: {
          name:  patientUser.name  ?? '',
          phone: patientUser.phone ?? '',
        },
      },
    };
  });

  return ok({
    stats: {
      total_patients:  totalPatientsRes.count ?? 0,
      active_doctors:  totalDoctorsRes.count  ?? 0,
      monthly_revenue: monthlyRevenue,          // bookings value (projected)
      collected:       collectedAmount,          // cash logged as paid
      admin_earnings:  monthlyRevenue * 0.4,
      today_sessions:  todaySessions.length,
      today_completed: todaySessions.filter((s) => s.session_status === 'COMPLETED').length,
      pending_bookings: pendingBookingsRes.count ?? 0,
    },
    recent_bookings: recentBookings,
  });
}
