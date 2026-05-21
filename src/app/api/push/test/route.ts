import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendPushToUsers } from '@/lib/push';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import type { AuthPayload } from '@/types';

// GET /api/push/test — shows subscription status + sends test notification to self
export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  const vapidOk = !!(
    process.env.VAPID_EMAIL &&
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY
  );

  const { data: subs, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, endpoint, created_at')
    .eq('user_id', user.userId);

  if (error) {
    return ok({
      vapid_env_set: vapidOk,
      table_exists: false,
      table_error: error.message,
      subscriptions: [],
    });
  }

  // Send test push to self
  let pushSent = false;
  let pushError: string | null = null;
  try {
    await sendPushToUsers([user.userId], {
      title: '🔔 SKCT Physio — Test Notification',
      body: 'Push notifications are working! You will receive appointment alerts here.',
      url: '/doctor/schedule',
      tag: 'push-test',
    });
    pushSent = true;
  } catch (e: any) {
    pushError = e?.message ?? String(e);
  }

  return ok({
    vapid_env_set: vapidOk,
    table_exists: true,
    subscriptions: (subs ?? []).map((s) => ({
      id: s.id,
      endpoint_short: (s.endpoint as string).slice(-30),
      created_at: s.created_at,
    })),
    push_sent: pushSent,
    push_error: pushError,
  });
}
