import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createCheckoutSession } from '@/lib/createCheckoutSessionStripe'; // Adjust path as needed

export async function POST(request) {
  try {
    const data = await request.json();
    
    const session = await createCheckoutSession(data);
    
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}