import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;

  const search = req.nextUrl.searchParams.get('search') ?? '';
  const sort   = req.nextUrl.searchParams.get('sort') ?? 'created_at';
  const order  = req.nextUrl.searchParams.get('order') === 'asc';
  const page   = Math.max(1, Number(req.nextUrl.searchParams.get('page') ?? '1'));
  const limit  = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get('limit') ?? '50')));
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('users')
    .select('id, name, phone, ref_number, created_at', { count: 'exact' })
    .eq('role', 'PATIENT');

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,ref_number.ilike.%${search}%`);
  }

  const validSortCols: Record<string, string> = {
    name: 'name',
    created_at: 'created_at',
    phone: 'phone',
    ref_number: 'ref_number',
  };
  const sortCol = validSortCols[sort] ?? 'created_at';
  query = query.order(sortCol, { ascending: order }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) return err('Failed to fetch patients', 500);

  // Enrich with booking counts
  const userIds = (data ?? []).map((u: any) => u.id);
  const bookingCounts: Record<string, number> = {};
  const sessionCounts: Record<string, number> = {};

  if (userIds.length) {
    const { data: bRows } = await supabaseAdmin
      .from('bookings')
      .select('patient_id')
      .in('patient_id', userIds);
    for (const b of bRows ?? []) {
      bookingCounts[(b as any).patient_id] = (bookingCounts[(b as any).patient_id] ?? 0) + 1;
    }

    const { data: sRows } = await supabaseAdmin
      .from('sessions')
      .select('patient_id')
      .in('patient_id', userIds)
      .eq('session_status', 'COMPLETED');
    for (const s of sRows ?? []) {
      sessionCounts[(s as any).patient_id] = (sessionCounts[(s as any).patient_id] ?? 0) + 1;
    }
  }

  const patients = (data ?? []).map((u: any) => ({
    id: u.id,
    name: u.name,
    phone: u.phone,
    ref_number: u.ref_number ?? '—',
    registered_at: u.created_at,
    total_bookings: bookingCounts[u.id] ?? 0,
    completed_sessions: sessionCounts[u.id] ?? 0,
  }));

  return ok({ patients, total: count ?? 0, page, limit });
}
