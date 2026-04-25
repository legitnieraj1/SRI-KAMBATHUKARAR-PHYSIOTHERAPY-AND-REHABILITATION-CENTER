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
    .from('doctors').select('id').eq('id', id).single();

  if (!doctor) return err('Doctor not found', 404);

  // Check sessions table for already-booked slots on this date
  const { data: bookedSessions } = await supabaseAdmin
    .from('sessions')
    .select('scheduled_time')
    .eq('doctor_id', id)
    .eq('scheduled_date', date)
    .neq('session_status', 'CANCELLED');

  const bookedSlots = (bookedSessions ?? []).map((s) => s.scheduled_time).filter(Boolean);

  // Available slots: 08:00–18:00 every 30 min
  const allSlots: string[] = [];
  for (let h = 8; h < 18; h++) {
    allSlots.push(`${String(h).padStart(2, '0')}:00`);
    allSlots.push(`${String(h).padStart(2, '0')}:30`);
  }

  const available = allSlots.filter((s) => !bookedSlots.includes(s));

  return ok({ date, doctor_id: id, available_slots: available, booked_slots: bookedSlots });
}
