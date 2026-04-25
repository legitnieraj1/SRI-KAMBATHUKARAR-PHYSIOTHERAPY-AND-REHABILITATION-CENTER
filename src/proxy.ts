import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = [
  '/',
  '/booking',
  '/stafflogin',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/bookings',
  '/api/doctors',
];

const ROLE_PATHS: Record<string, string[]> = {
  '/admin': ['SUPER_ADMIN'],
  '/doctor': ['DOCTOR', 'SUPER_ADMIN'],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('physio_token')?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    return NextResponse.redirect(new URL('/stafflogin', request.url));
  }

  for (const [prefix, roles] of Object.entries(ROLE_PATHS)) {
    if (pathname.startsWith(prefix) && !roles.includes(user.role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.userId);
  requestHeaders.set('x-user-role', user.role);
  requestHeaders.set('x-user-phone', user.phone);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)'],
};
