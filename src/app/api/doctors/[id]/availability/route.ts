import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err } from '@/lib/api-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const date = req.nextUrl.searchParams.get('date');

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return err('date query param required (YYYY-MM-DD)', 400);
  }

  const { data: doctor } = await supabaseAdmin
    .from('doctors').select('id, availability_start, availability_end').eq('id', id).single();

  if (!doctor) return err('Doctor not found', 404);

  // Get booked slots from sessions (sessions store scheduled_time, not bookings)
  const { data: bookedSessions } = await supabaseAdmin
    .from('sessions')
    .select('scheduled_time')
    .eq('doctor_id', id)
    .eq('scheduled_date', date)
    .neq('session_status', 'CANCELLED');

  const bookedSlots = (bookedSessions ?? []).map((s: any) => {
    // scheduled_time comes back as HH:MM:SS from Postgres TIME type — trim to HH:MM
    const t = s.scheduled_time as string;
    return t.length > 5 ? t.slice(0, 5) : t;
  });

  // Generate slots from doctor's availability window (default 08:00–18:00)
  const startHour = doctor.availability_start
    ? parseInt((doctor.availability_start as string).slice(0, 2), 10)
    : 8;
  const endHour = doctor.availability_end
    ? parseInt((doctor.availability_end as string).slice(0, 2), 10)
    : 18;

  const allSlots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    allSlots.push(`${String(h).padStart(2, '0')}:00`);
    allSlots.push(`${String(h).padStart(2, '0')}:30`);
  }

  const available = allSlots.filter((s) => !bookedSlots.includes(s));

  return ok({ date, doctor_id: id, available_slots: available, booked_slots: bookedSlots });
}
