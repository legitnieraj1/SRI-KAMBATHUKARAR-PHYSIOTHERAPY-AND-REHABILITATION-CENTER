import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAuth();
  if (result instanceof Response) return result;

  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select(`
      id, scheduled_date, scheduled_time, session_number, session_status, notes, created_at,
      bookings!inner(id, package_type, visit_type, amount),
      patients!inner(id, users!inner(id, name, phone)),
      attendance(id, status, marked_at),
      photos(id, file_url, photo_timestamp)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return err('Session not found', 404);

  // Normalise for frontend compatibility
  const normalised = {
    ...data,
    session_date: (data as any).scheduled_date,
    status: (data as any).session_status,
    bookings: {
      ...(data as any).bookings,
      scheduled_time: (data as any).scheduled_time,
      patients: (data as any).patients,
    },
    attendance: ((data as any).attendance ?? []).map((a: any) => ({ ...a, attendance_status: a.status })),
    photos: (data as any).photos ?? [],
  };

  return ok(normalised);
}
