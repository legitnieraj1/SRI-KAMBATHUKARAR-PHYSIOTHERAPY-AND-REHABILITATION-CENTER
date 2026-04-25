import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import type { AuthPayload } from '@/types';

export async function POST(req: NextRequest) {
  const result = await requireAuth(['PATIENT']);
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  const body = await req.json().catch(() => null);
  const bookingId = body?.booking_id as string | undefined;
  if (!bookingId) return err('booking_id is required', 400);

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('id, total_amount, status, patients!inner(user_id)')
    .eq('id', bookingId)
    .single();

  if (!booking) return err('Booking not found', 404);
  if ((booking.patients as any).user_id !== user.userId) return err('Forbidden', 403);
  if (booking.status !== 'PENDING') return err('Booking is not in pending state', 400);

  // Razorpay order creation
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret || razorpayKeyId === 'your-razorpay-key-id') {
    // Dev mode: skip real Razorpay, return mock order
    return ok({
      order_id: `order_dev_${Date.now()}`,
      amount: booking.total_amount * 100,
      currency: 'INR',
      key: razorpayKeyId,
      dev_mode: true,
    });
  }

  const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64'),
    },
    body: JSON.stringify({
      amount: booking.total_amount * 100,
      currency: 'INR',
      receipt: bookingId,
    }),
  });

  if (!orderRes.ok) return err('Failed to create payment order', 500);
  const order = await orderRes.json();

  return ok({ order_id: order.id, amount: order.amount, currency: order.currency, key: razorpayKeyId });
}
