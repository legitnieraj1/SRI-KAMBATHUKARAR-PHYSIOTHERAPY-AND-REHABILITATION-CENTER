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
      users!bookings_patient_id_fkey(id, name, phone)
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

  // Find or create user by phone — patient_id in bookings/sessions is users.id
  let { data: user } = await supabaseAdmin
    .from('users').select('id, role').eq('phone', phone).single();

  if (!user) {
    const { data: newUser, error: userErr } = await supabaseAdmin
      .from('users')
      .insert({ phone, name, role: 'PATIENT' })
      .select('id, role')
      .single();
    if (userErr || !newUser) {
      console.error('USER INSERT ERROR:', JSON.stringify(userErr));
      return err('Failed to create patient account', 500);
    }
    user = newUser;
  } else if (user.role === 'PATIENT') {
    await supabaseAdmin.from('users').update({ name }).eq('id', user.id);
  }

  // Check slot not already taken
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

  // Per-session pricing varies by visit type
  // CENTER: ₹100/session  ·  HOME: ₹500/session (covers travel + on-site care)
  const perSession = visit_type === 'HOME' ? 500 : 100;
  const sessions_count = package_type === 'ONE_DAY' ? 1 : 5;
  const amount = perSession * sessions_count;

  // patient_id in bookings = users.id (NOT patients.id)
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .insert({
      patient_id: user.id,
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

  // Create session records — patient_id in sessions = users.id too
  const sessionDates = generateSessionDates(start_date, sessions_count);
  const sessionRows = sessionDates.map((date, i) => ({
    booking_id: booking.id,
    doctor_id,
    patient_id: user!.id,
    scheduled_date: date,
    scheduled_time,
    session_number: i + 1,
    session_status: 'PENDING',
  }));

  const { error: sessionsError } = await supabaseAdmin.from('sessions').insert(sessionRows);
  if (sessionsError) console.error('SESSIONS INSERT ERROR:', JSON.stringify(sessionsError));

  return ok({ ...booking, patient_name: name, patient_phone: phone }, 201);
}

// SKCT operates Mon–Sat; generate session dates excluding Sunday only
function generateSessionDates(startDate: string, count: number): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  while (dates.length < count) {
    if (current.getDay() !== 0) dates.push(current.toISOString().split('T')[0]); // exclude Sunday
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
