import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/signin?error=missing_code', request.url));
  }

  try {
    // Handle Google OAuth callback
    // This would typically involve exchanging the code for tokens
    // and creating/updating user session
    
    // For now, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/signin?error=oauth_error', request.url));
  }
}