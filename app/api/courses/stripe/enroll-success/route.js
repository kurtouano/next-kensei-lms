import { stripe } from "@/lib/stripe/stripe"
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    // Get the line items to get the course name
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId)
    const courseName = lineItems.data[0]?.description || 'Course Purchase'

    return NextResponse.json({
      success: true,
      courseName: courseName,
      amount: session.amount_total, // Amount in cents
      currency: session.currency
    })

  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ error: 'Failed to fetch session data' }, { status: 500 })
  }
}