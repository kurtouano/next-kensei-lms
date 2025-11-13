// app/api/auth/session/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const userAgent = request.headers.get('user-agent') || '';
    
    // Detect if this is a crawler/bot request
    const isCrawler = /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver/i.test(userAgent);
    
    // For unauthenticated requests:
    // - Return 200 with null user for crawlers (prevents Google Search Console errors)
    // - Return 200 with null user for normal users too (safer, no breaking changes)
    // This endpoint appears to be unused in the codebase (uses useSession() hook instead)
    // But we maintain backward compatibility by returning 200 instead of 401
    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Return user data from NextAuth session for authenticated users
    return NextResponse.json({ 
      user: {
        _id: session.user.id,
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        icon: session.user.icon,
        country: session.user.country
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Session error:', error);
    // Return 200 with null instead of 500 to prevent crawling errors
    // This is safe because the codebase uses useSession() hook, not this endpoint
    return NextResponse.json({ user: null }, { status: 200 });
  }
}