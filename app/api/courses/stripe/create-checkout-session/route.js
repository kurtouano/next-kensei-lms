// app/api/courses/stripe/create-checkout-session/route.js - FIXED VERSION
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
    
    // DEBUG: Log incoming data
    console.log('=== STRIPE API DEBUG ===')
    console.log('Received data:', data)
    console.log('User email:', session.user.email)
    console.log('========================')
    
    // FIXED: Better validation with detailed error messages
    const validationErrors = [];
    
    if (!data.courseId) {
      validationErrors.push('courseId is required');
    }
    if (!data.title) {
      validationErrors.push('title is required');
    }
    if (data.price === undefined || data.price === null) {
      validationErrors.push('price is required');
    }
    
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return NextResponse.json(
        { error: `Missing required course data: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }

    // FIXED: Ensure price is a valid number
    const processedData = {
      ...data,
      price: Number(data.price) || 0,
      // Provide defaults for optional fields
      description: data.description || data.title || 'Course enrollment',
      thumbnail: data.thumbnail || ''
    };

    console.log('Creating checkout session for:', {
      courseId: processedData.courseId,
      title: processedData.title,
      price: processedData.price,
      userEmail: session.user.email
    });

    const stripeSession = await createCheckoutSession(processedData);
    
    if (!stripeSession || !stripeSession.url) {
      console.error('Invalid stripe session response:', stripeSession);
      return NextResponse.json(
        { error: 'Failed to create valid checkout session' },
        { status: 500 }
      );
    }
    
    console.log('Checkout session created successfully:', stripeSession.url);
    
    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // FIXED: More detailed error handling
    const errorMessage = error.message || 'Failed to create checkout session';
    const statusCode = error.statusCode || 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}