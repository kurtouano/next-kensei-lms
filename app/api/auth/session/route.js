// app/api/auth/session/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Return user data from NextAuth session
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}