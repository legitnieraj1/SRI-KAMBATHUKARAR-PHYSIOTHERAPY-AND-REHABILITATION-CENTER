import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import { generateReportSchema } from '@/lib/validators';
import type { AuthPayload } from '@/types';

export async function GET() {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;

  const { data, error } = await supabaseAdmin
    .from('monthly_reports')
    .select(`*, doctor_earnings(id, doctor_id, sessions_count, total_revenue, commission, doctors!inner(users!inner(name)))`)
    .order('month', { ascending: false });

  if (error) return err('Failed to fetch reports', 500);
  return ok(data);
}

export async function POST(req: NextRequest) {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  const body = await req.json().catch(() => null);
  const parsed = generateReportSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { month } = parsed.data;

  const { data: existing } = await supabaseAdmin
    .from('monthly_reports')
    .select('id, status')
    .eq('month', month)
    .maybeSingle();

  if (existing?.status === 'LOCKED') return err('This report is locked and cannot be regenerated', 400);

  const startDate = `${month}-01`;
  const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
    .toISOString().split('T')[0];

  // Count completed sessions per doctor in the month
  const { data: completedSessions } = await supabaseAdmin
    .from('sessions')
    .select('doctor_id, bookings!inner(amount, sessions_count)')
    .eq('session_status', 'COMPLETED')
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate);

  // Sum total revenue from bookings that started this month
  const { data: monthBookings } = await supabaseAdmin
    .from('bookings')
    .select('amount')
    .gte('start_date', startDate)
    .lte('start_date', endDate)
    .neq('status', 'CANCELLED');

  const totalRevenue = (monthBookings ?? []).reduce((s, b) => s + (b.amount ?? 0), 0);
  const totalSessions = (completedSessions ?? []).length;
  const superAdminShare = totalRevenue * 0.4;

  // Aggregate earnings per doctor
  const doctorMap: Record<string, { sessions: number; revenue: number }> = {};
  for (const s of completedSessions ?? []) {
    const did = s.doctor_id;
    if (!doctorMap[did]) doctorMap[did] = { sessions: 0, revenue: 0 };
    const perSession = ((s.bookings as any)?.amount ?? 0) / ((s.bookings as any)?.sessions_count ?? 1);
    doctorMap[did].sessions += 1;
    doctorMap[did].revenue += perSession;
  }

  // Upsert monthly report
  let report;
  const reportPayload = {
    month,
    total_sessions: totalSessions,
    total_revenue: totalRevenue,
    super_admin_share: superAdminShare,
    status: 'DRAFT',
    generated_at: new Date().toISOString(),
    generated_by: user.userId,
  };

  if (existing) {
    const { data: updated } = await supabaseAdmin
      .from('monthly_reports').update(reportPayload).eq('id', existing.id).select().single();
    report = updated;
  } else {
    const { data: created } = await supabaseAdmin
      .from('monthly_reports').insert(reportPayload).select().single();
    report = created;
  }

  if (!report) return err('Failed to save report', 500);

  // Upsert doctor_earnings per doctor
  for (const [doctor_id, agg] of Object.entries(doctorMap)) {
    const commission = agg.revenue * 0.6;
    await supabaseAdmin.from('doctor_earnings').upsert({
      doctor_id,
      report_id: report.id,
      sessions_count: agg.sessions,
      total_revenue: agg.revenue,
      commission,
    }, { onConflict: 'doctor_id,report_id' });
  }

  return ok(report, existing ? 200 : 201);
}
