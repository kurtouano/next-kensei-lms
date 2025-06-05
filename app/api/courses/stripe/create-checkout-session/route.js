// app/api/courses/stripe/create-checkout-session/route.js
import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/createCheckoutSession';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'User must be logged in to purchase a course' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.courseId || !data.title || data.price === undefined) {
      return NextResponse.json(
        { error: 'Missing required course data' },
        { status: 400 }
      );
    }

    console.log('Creating checkout session for:', {
      courseId: data.courseId,
      title: data.title,
      price: data.price,
      userEmail: session.user.email
    });

    const stripeSession = await createCheckoutSession(data);
    
    console.log('Checkout session created successfully:', stripeSession.url);
    
    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}