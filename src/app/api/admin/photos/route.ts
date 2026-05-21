import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import type { AuthPayload } from '@/types';

// GET /api/admin/photos — all session photos for super admin gallery
export async function GET(req: NextRequest) {
  const result = await requireAuth(['SUPER_ADMIN']);
  if (result instanceof Response) return result;

  const limit  = parseInt(req.nextUrl.searchParams.get('limit')  ?? '50');
  const offset = parseInt(req.nextUrl.searchParams.get('offset') ?? '0');

  const { data, error } = await supabaseAdmin
    .from('photos')
    .select(`
      id, file_url, photo_timestamp,
      sessions!inner(
        id, scheduled_date, scheduled_time, session_number,
        bookings!inner(visit_type, package_type),
        users!sessions_patient_id_fkey(name, phone)
      ),
      users!photos_doctor_id_fkey(name)
    `)
    .order('photo_timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Admin photos fetch error:', error.message);
    return err('Failed to fetch photos', 500);
  }

  const normalised = (data ?? []).map((p: any) => {
    const session = p.sessions ?? {};
    const patient = session['users!sessions_patient_id_fkey'] ?? session.users ?? {};
    const doctor  = p['users!photos_doctor_id_fkey'] ?? p.users ?? {};
    const t: string = session.scheduled_time ?? '';
    return {
      id:              p.id,
      file_url:        p.file_url,
      photo_timestamp: p.photo_timestamp,
      session_date:    session.scheduled_date ?? '',
      session_time:    t.length > 5 ? t.slice(0, 5) : t,
      session_number:  session.session_number ?? 1,
      visit_type:      session.bookings?.visit_type ?? '',
      doctor_name:     doctor.name ?? 'Unknown',
      patient_name:    patient.name ?? 'Unknown',
      patient_phone:   patient.phone ?? '',
    };
  });

  return ok(normalised);
}
