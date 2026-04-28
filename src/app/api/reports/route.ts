import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import { generateReportSchema } from '@/lib/validators';
import type { AuthPayload } from '@/types';

// Normalise a DB row → shape the frontend Report interface expects
function normaliseReport(r: any) {
  const earnings: any[] = r.doctor_earnings ?? [];
  const totalDoctorPayout = earnings.reduce((s: number, e: any) => s + (e.commission ?? 0), 0);

  const doctorBreakdown = earnings.map((e: any) => ({
    doctor_id: e.doctor_id,
    name: e.doctors?.users?.name ?? 'Unknown',
    sessions: e.sessions_count ?? 0,
    total: e.commission ?? 0,
  }));

  return {
    id:                   r.id,
    month:                (r.month as string).slice(0, 7), // "2026-04-01" → "2026-04"
    total_sessions:       r.total_sessions ?? 0,
    total_revenue:        r.total_revenue ?? 0,
    total_doctor_payout:  totalDoctorPayout,
    total_admin_earnings: r.super_admin_share ?? 0,
    status:               r.status,
    generated_at:         r.generated_at,
    doctor_breakdown:     doctorBreakdown,
  };
}

export async function GET() {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;

  const { data, error } = await supabaseAdmin
    .from('monthly_reports')
    .select(`
      id, month, total_sessions, total_revenue, super_admin_share, status, generated_at,
      doctor_earnings(
        id, doctor_id, sessions_count, total_revenue, commission,
        doctors!inner(users!inner(name))
      )
    `)
    .order('month', { ascending: false });

  if (error) return err('Failed to fetch reports', 500);
  return ok((data ?? []).map(normaliseReport));
}

export async function POST(req: NextRequest) {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  const body = await req.json().catch(() => null);
  const parsed = generateReportSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { month } = parsed.data;
  const monthDate = `${month}-01`; // DB column is type DATE — needs full date

  const { data: existing } = await supabaseAdmin
    .from('monthly_reports')
    .select('id, status')
    .eq('month', monthDate)
    .maybeSingle();

  if (existing?.status === 'LOCKED') return err('This report is locked and cannot be regenerated', 400);

  const startDate = monthDate;
  const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
    .toISOString().split('T')[0];

  // Completed sessions for this month with booking amount
  const { data: completedSessions } = await supabaseAdmin
    .from('sessions')
    .select('doctor_id, bookings!inner(amount, sessions_count)')
    .eq('session_status', 'COMPLETED')
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate);

  // Total revenue from non-cancelled bookings that started this month
  const { data: monthBookings } = await supabaseAdmin
    .from('bookings')
    .select('amount')
    .gte('start_date', startDate)
    .lte('start_date', endDate)
    .neq('status', 'CANCELLED');

  const totalRevenue   = (monthBookings ?? []).reduce((s, b) => s + (b.amount ?? 0), 0);
  const totalSessions  = (completedSessions ?? []).length;
  const superAdminShare = Math.round(totalRevenue * 0.4 * 100) / 100;

  // Aggregate per doctor
  const doctorMap: Record<string, { sessions: number; revenue: number }> = {};
  for (const s of completedSessions ?? []) {
    const did = s.doctor_id;
    if (!doctorMap[did]) doctorMap[did] = { sessions: 0, revenue: 0 };
    const perSession = ((s.bookings as any)?.amount ?? 0) / ((s.bookings as any)?.sessions_count ?? 1);
    doctorMap[did].sessions += 1;
    doctorMap[did].revenue  += perSession;
  }

  // Upsert monthly_reports row
  const reportPayload = {
    month:             monthDate,   // ← full date, not YYYY-MM
    total_sessions:    totalSessions,
    total_revenue:     totalRevenue,
    super_admin_share: superAdminShare,
    status:            'GENERATED',
    generated_at:      new Date().toISOString(),
    generated_by:      user.userId,
  };

  let reportId: string;
  if (existing) {
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('monthly_reports').update(reportPayload).eq('id', existing.id).select('id').single();
    if (updateErr || !updated) return err('Failed to save report: ' + (updateErr?.message ?? 'unknown'), 500);
    reportId = updated.id;
  } else {
    const { data: created, error: insertErr } = await supabaseAdmin
      .from('monthly_reports').insert(reportPayload).select('id').single();
    if (insertErr || !created) return err('Failed to save report: ' + (insertErr?.message ?? 'unknown'), 500);
    reportId = created.id;
  }

  // Upsert doctor_earnings
  for (const [doctor_id, agg] of Object.entries(doctorMap)) {
    const commission = Math.round(agg.revenue * 0.6 * 100) / 100;
    await supabaseAdmin.from('doctor_earnings').upsert({
      doctor_id,
      report_id:      reportId,
      sessions_count: agg.sessions,
      total_revenue:  Math.round(agg.revenue * 100) / 100,
      commission,
    }, { onConflict: 'doctor_id,report_id' });
  }

  // Fetch the saved row (with doctor_earnings joined) and return normalised
  const { data: savedReport } = await supabaseAdmin
    .from('monthly_reports')
    .select(`
      id, month, total_sessions, total_revenue, super_admin_share, status, generated_at,
      doctor_earnings(
        id, doctor_id, sessions_count, total_revenue, commission,
        doctors!inner(users!inner(name))
      )
    `)
    .eq('id', reportId)
    .single();

  return ok(normaliseReport(savedReport), existing ? 200 : 201);
}
