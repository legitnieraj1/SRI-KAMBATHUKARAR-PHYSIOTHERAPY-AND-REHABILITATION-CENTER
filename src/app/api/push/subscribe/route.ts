import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ok, err, requireAuth } from '@/lib/api-helpers';
import type { AuthPayload } from '@/types';

export async function POST(req: NextRequest) {
  const result = await requireAuth();
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  const body = await req.json().catch(() => null);
  const { endpoint, keys } = body ?? {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) return err('Invalid push subscription', 400);

  const { error } = await supabaseAdmin.from('push_subscriptions').upsert(
    { user_id: user.userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    { onConflict: 'user_id,endpoint' }
  );

  if (error) {
    // Table may not exist yet — fail silently so portal still loads
    console.warn('push_subscriptions upsert failed:', error.message);
  }

  return ok({ subscribed: true });
}

export async function DELETE(req: NextRequest) {
  const result = await requireAuth();
  if (result instanceof Response) return result;
  const user = result as AuthPayload;

  const { endpoint } = await req.json().catch(() => ({}));
  if (endpoint) {
    await supabaseAdmin.from('push_subscriptions').delete()
      .eq('user_id', user.userId).eq('endpoint', endpoint);
  }

  return ok({ unsubscribed: true });
}
