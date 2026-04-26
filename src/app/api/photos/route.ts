import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import type { AuthPayload } from '@/types';

export async function POST(req: NextRequest) {
  const result = await requireAuth(['DOCTOR', 'SUPER_ADMIN']);
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  const formData = await req.formData().catch(() => null);
  if (!formData) return err('Invalid form data', 400);

  const sessionId = formData.get('session_id') as string | null;
  const file = formData.get('photo') as File | null;

  if (!sessionId) return err('session_id is required', 400);
  if (!file) return err('photo file is required', 400);

  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('id, doctor_id')
    .eq('id', sessionId)
    .single();

  if (!session) return err('Session not found', 404);

  // photos.doctor_id is FK → users.id, so we need the doctor's user_id
  const { data: doctorRow } = await supabaseAdmin
    .from('doctors').select('id, user_id').eq('id', session.doctor_id).single();

  if (user.role === 'DOCTOR') {
    const myDoctorRow = await supabaseAdmin
      .from('doctors').select('id').eq('user_id', user.userId).single();
    if (!myDoctorRow.data || session.doctor_id !== myDoctorRow.data.id) return err('Forbidden', 403);
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const storagePath = `sessions/${sessionId}/${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from('attendance-photos')
    .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) return err('Failed to upload photo: ' + uploadError.message, 500);

  // Get public URL for storage
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('attendance-photos')
    .getPublicUrl(storagePath);

  const { data: photo, error: dbError } = await supabaseAdmin
    .from('photos')
    .insert({
      session_id: sessionId,
      doctor_id: doctorRow?.user_id ?? null,  // photos.doctor_id → users.id (not doctors.id)
      file_url: publicUrl,
      file_size: file.size,
      photo_timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (dbError) return err('Failed to save photo record', 500);

  return ok(photo, 201);
}

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result instanceof Response) return result;

  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) return err('session_id query param required', 400);

  const { data, error } = await supabaseAdmin
    .from('photos')
    .select('id, file_url, photo_timestamp')
    .eq('session_id', sessionId)
    .order('photo_timestamp', { ascending: true });

  if (error) return err('Failed to fetch photos', 500);
  return ok(data);
}
