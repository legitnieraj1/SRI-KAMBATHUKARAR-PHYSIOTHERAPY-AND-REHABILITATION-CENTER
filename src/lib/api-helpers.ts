import { NextResponse } from 'next/server';
import type { AuthPayload } from '@/types';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function getUser(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('physio_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(roles?: string[]): Promise<AuthPayload | Response> {
  const user = await getUser();
  if (!user) return err('Unauthorized', 401) as unknown as Response;
  if (roles && !roles.includes(user.role)) return err('Forbidden', 403) as unknown as Response;
  return user;
}
