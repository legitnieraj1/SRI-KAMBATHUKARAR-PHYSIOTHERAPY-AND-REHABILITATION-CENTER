import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = body ?? {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking_id) {
    return err('Missing payment verification fields', 400);
  }

  const secret = process.env.RAZORPAY_KEY_SECRET ?? '';
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSig !== razorpay_signature) return err('Payment verification failed', 400);

  const { data: booking } = await supabaseAdmin
    .from('bookings').select('id, total_amount').eq('id', booking_id).single();
  if (!booking) return err('Booking not found', 404);

  await supabaseAdmin.from('payments').insert({
    booking_id,
    amount: booking.total_amount,
    method: 'ONLINE',
    status: 'PAID',
    transaction_id: razorpay_payment_id,
    paid_at: new Date().toISOString(),
  });

  await supabaseAdmin.from('bookings').update({ status: 'CONFIRMED' }).eq('id', booking_id);

  return ok({ message: 'Payment confirmed', booking_id });
}
