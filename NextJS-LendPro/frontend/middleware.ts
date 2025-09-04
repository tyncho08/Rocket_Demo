import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedPaths = ['/dashboard', '/loan-application'];
  const adminPaths = ['/admin'];
  
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
  
  // Redirect to login if accessing protected route without authentication
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // Redirect to home if accessing admin route without admin role
  if (isAdminPath && token?.role !== 'Admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Redirect to dashboard if accessing auth pages while authenticated
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/loan-application/:path*',
    '/admin/:path*',
    '/login',
    '/register'
  ]
};