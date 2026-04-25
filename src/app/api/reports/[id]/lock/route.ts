import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;

  const { id } = await params;

  const { data: report } = await supabaseAdmin
    .from('monthly_reports')
    .select('id, status')
    .eq('id', id)
    .single();

  if (!report) return err('Report not found', 404);
  if (report.status === 'LOCKED') return err('Report is already locked', 400);

  const { data, error } = await supabaseAdmin
    .from('monthly_reports')
    .update({ status: 'LOCKED', locked_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return err('Failed to lock report', 500);
  return ok(data);
}
