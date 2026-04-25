import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import { createBookingSchema } from '@/lib/validators';
import type { AuthPayload } from '@/types';

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  let query = supabaseAdmin
    .from('bookings')
    .select(`
      id, package_type, visit_type, start_date, scheduled_time, status, amount, sessions_count, notes, created_at,
      doctors!inner(id, specialization, users!inner(id, name, phone)),
      patients!inner(id, users!inner(id, name, phone))
    `)
    .order('start_date', { ascending: false });

  if (user.role === 'DOCTOR') {
    const { data: doctor } = await supabaseAdmin
      .from('doctors').select('id').eq('user_id', user.userId).single();
    if (!doctor) return ok([]);
    query = query.eq('doctor_id', doctor.id);
  }

  const { data, error } = await query;
  if (error) return err('Failed to fetch bookings', 500);
  return ok(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { name, phone, doctor_id, package_type, visit_type, start_date, scheduled_time, notes } = parsed.data;

  // Find or create user by phone (any role — phone is unique)
  let { data: user } = await supabaseAdmin
    .from('users').select('id, role').eq('phone', phone).single();

  if (!user) {
    const { data: newUser, error: userErr } = await supabaseAdmin
      .from('users').insert({ phone, name, role: 'PATIENT' }).select('id, role').single();
    if (userErr || !newUser) return err('Failed to create patient record', 500);
    user = newUser;
  } else if (user.role === 'PATIENT') {
    await supabaseAdmin.from('users').update({ name }).eq('id', user.id);
  }

  // Find or create patient record
  let { data: patient } = await supabaseAdmin
    .from('patients').select('id').eq('user_id', user.id).single();

  if (!patient) {
    const { data: newPatient, error: patErr } = await supabaseAdmin
      .from('patients').insert({ user_id: user.id }).select('id').single();
    if (patErr || !newPatient) return err('Failed to create patient profile', 500);
    patient = newPatient;
  }

  // Check slot not already taken (via sessions table — sessions store the actual time)
  const { data: conflict } = await supabaseAdmin
    .from('sessions')
    .select('id')
    .eq('doctor_id', doctor_id)
    .eq('scheduled_date', start_date)
    .eq('scheduled_time', scheduled_time)
    .neq('session_status', 'CANCELLED')
    .limit(1)
    .maybeSingle();

  if (conflict) return err('This time slot is already booked. Please choose another.', 409);

  const amount = package_type === 'ONE_DAY' ? 100 : 300;
  const sessions_count = package_type === 'ONE_DAY' ? 1 : 5;

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .insert({
      patient_id: patient.id,
      doctor_id,
      package_type,
      visit_type,
      start_date,
      scheduled_time,
      sessions_count,
      amount,
      notes,
      status: 'PENDING',
    })
    .select()
    .single();

  if (bookingError || !booking) {
    console.error('BOOKING INSERT ERROR:', JSON.stringify(bookingError));
    return err(`Failed to create booking: ${bookingError?.message ?? 'unknown'}`, 500);
  }

  // Create individual session records
  const sessionDates = generateSessionDates(start_date, sessions_count);
  const sessionRows = sessionDates.map((date, i) => ({
    booking_id: booking.id,
    doctor_id,
    patient_id: patient!.id,
    scheduled_date: date,
    scheduled_time,
    session_number: i + 1,
    session_status: 'PENDING',
  }));

  const { error: sessionsError } = await supabaseAdmin.from('sessions').insert(sessionRows);
  if (sessionsError) console.error('SESSIONS INSERT ERROR:', JSON.stringify(sessionsError));

  return ok({ ...booking, patient_name: name, patient_phone: phone }, 201);
}

function generateSessionDates(startDate: string, count: number): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  while (dates.length < count) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
