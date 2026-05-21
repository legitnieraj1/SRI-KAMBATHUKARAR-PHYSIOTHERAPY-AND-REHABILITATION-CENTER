import webpush from 'web-push';
import { supabaseAdmin } from './supabase-admin';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  if (!userIds.length) return;

  const { data: subs, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .in('user_id', userIds);

  if (error || !subs?.length) return;

  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      ).catch(() => {
        // stale subscription — remove it
        supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
      })
    )
  );
}
