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
      users!sessions_patient_id_fkey(id, name, phone),
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

  // Supabase JS returns the FK-hinted join under the plain table name key
  // Try both the hint key and the plain key so it works regardless of client version
  const normalised = (data ?? []).map((s: any) => {
    const patientUser =
      s['users!sessions_patient_id_fkey'] ??
      s['users'] ??
      {};

    // Postgres TIME type comes back as HH:MM:SS — trim to HH:MM
    const trimTime = (t: string) => (t && t.length > 5 ? t.slice(0, 5) : t ?? '');

    return {
      id: s.id,
      session_date: s.scheduled_date,
      scheduled_time: trimTime(s.scheduled_time),
      session_number: s.session_number,
      status: s.session_status,
      notes: s.notes,
      bookings: {
        id: s.bookings?.id,
        package_type: s.bookings?.package_type,
        visit_type: s.bookings?.visit_type,
        scheduled_time: trimTime(s.scheduled_time),
        patients: {
          id: patientUser.id ?? '',
          users: {
            name: patientUser.name ?? '',
            phone: patientUser.phone ?? '',
          },
        },
        doctors: { users: { name: '' } },
      },
      attendance: (s.attendance ?? []).map((a: any) => ({ attendance_status: a.status })),
      photos: (s.photos ?? []).map((p: any) => ({ id: p.id })),
    };
  });

  return ok(normalised);
}
