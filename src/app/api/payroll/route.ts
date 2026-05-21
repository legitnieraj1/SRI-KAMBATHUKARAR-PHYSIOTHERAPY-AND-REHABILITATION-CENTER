import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;

  const month = req.nextUrl.searchParams.get('month'); // YYYY-MM or null (all-time)

  if (month) {
    const monthDate = `${month}-01`;
    const { data: report } = await supabaseAdmin
      .from('monthly_reports')
      .select(`
        id, month, total_sessions, total_revenue, super_admin_share, status,
        doctor_earnings(
          id, doctor_id, sessions_count, total_revenue, commission,
          doctors!inner(id, is_active, users!inner(id, name, phone))
        )
      `)
      .eq('month', monthDate)
      .maybeSingle();

    if (!report) {
      return ok({ month, report: null, doctors: [] });
    }

    const doctors = ((report as any).doctor_earnings ?? []).map((e: any) => ({
      doctor_id: e.doctor_id,
      name: e.doctors?.users?.name ?? 'Unknown',
      phone: e.doctors?.users?.phone ?? '',
      sessions_count: e.sessions_count ?? 0,
      total_revenue: e.total_revenue ?? 0,
      doctor_share: e.commission ?? 0,
      admin_share: Math.round(((e.total_revenue ?? 0) - (e.commission ?? 0)) * 100) / 100,
    }));

    return ok({
      month,
      report: {
        id: (report as any).id,
        status: (report as any).status,
        total_sessions: (report as any).total_sessions,
        total_revenue: (report as any).total_revenue,
        total_doctor_payout: (report as any).total_revenue - (report as any).super_admin_share,
        total_admin_share: (report as any).super_admin_share,
      },
      doctors,
    });
  }

  // All-time: aggregate directly from sessions
  const { data: completedSessions } = await supabaseAdmin
    .from('sessions')
    .select('doctor_id, bookings!inner(amount, sessions_count)')
    .eq('session_status', 'COMPLETED');

  const { data: allDoctors } = await supabaseAdmin
    .from('doctors')
    .select('id, is_active, users!inner(id, name, phone)')
    .eq('is_active', true);

  const doctorMap: Record<string, { sessions: number; revenue: number }> = {};
  for (const s of completedSessions ?? []) {
    const did = (s as any).doctor_id;
    if (!doctorMap[did]) doctorMap[did] = { sessions: 0, revenue: 0 };
    const perSession = ((s as any).bookings?.amount ?? 0) / ((s as any).bookings?.sessions_count ?? 1);
    doctorMap[did].sessions += 1;
    doctorMap[did].revenue  += perSession;
  }

  const doctors = (allDoctors ?? []).map((d: any) => {
    const agg = doctorMap[d.id] ?? { sessions: 0, revenue: 0 };
    const doctorShare = Math.round(agg.revenue * 0.6 * 100) / 100;
    return {
      doctor_id: d.id,
      name: d.users?.name ?? 'Unknown',
      phone: d.users?.phone ?? '',
      sessions_count: agg.sessions,
      total_revenue: Math.round(agg.revenue * 100) / 100,
      doctor_share: doctorShare,
      admin_share: Math.round((agg.revenue - doctorShare) * 100) / 100,
    };
  }).filter((d) => d.sessions_count > 0 || true);

  return ok({ month: null, report: null, doctors });
}
