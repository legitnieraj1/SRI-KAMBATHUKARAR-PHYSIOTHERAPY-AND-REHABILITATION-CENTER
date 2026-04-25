import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import type { AuthPayload } from '@/types';

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  const date = req.nextUrl.searchParams.get('date');

  let query = supabaseAdmin
    .from('sessions')
    .select(`
      id, scheduled_date, scheduled_time, session_number, session_status, notes,
      bookings!inner(id, package_type, visit_type),
      patients!inner(id, users!inner(id, name, phone)),
      attendance(id, status, marked_at),
      photos(id, file_url)
    `)
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time', { ascending: true });

  if (date) query = query.eq('scheduled_date', date);

  if (user.role === 'DOCTOR') {
    const { data: doctor } = await supabaseAdmin
      .from('doctors').select('id').eq('user_id', user.userId).single();
    if (!doctor) return ok([]);
    query = query.eq('doctor_id', doctor.id);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Sessions fetch error:', JSON.stringify(error));
    return err('Failed to fetch sessions', 500);
  }

  // Normalise field names for frontend compatibility
  const normalised = (data ?? []).map((s: any) => ({
    ...s,
    session_date: s.scheduled_date,
    status: s.session_status,
    bookings: {
      ...s.bookings,
      scheduled_time: s.scheduled_time,
      patients: s.patients,
      doctors: { users: { name: user.role === 'DOCTOR' ? '' : '' } },
    },
    attendance: s.attendance?.map((a: any) => ({ ...a, attendance_status: a.status })) ?? [],
    photos: s.photos ?? [],
  }));

  return ok(normalised);
}
