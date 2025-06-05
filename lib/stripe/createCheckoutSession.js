// lib/stripe/createCheckoutSession.js
import { headers } from 'next/headers';
import { stripe } from './stripe';

const CURRENCY = 'usd';

// Helper function
function formatAmountForStripe(amount, currency) {
  let numberFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
  });

  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;

  for (const part of parts) {
    if (part.type === "decimal") {
      zeroDecimalCurrency = false;
      break;
    }
  }

  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
}

export async function createCheckoutSession(data) {
  const headersList = await headers();
  const origin = headersList.get('origin') || 'http://localhost:3000';

  const successUrl = `${origin}/courses/enroll-success?session_id={CHECKOUT_SESSION_ID}&courseId=${data.courseId}`;
  const cancelUrl = `${origin}/courses`;

  console.log('Creating Stripe checkout session with URLs:', {
    successUrl,
    cancelUrl,
    courseId: data.courseId,
    price: data.price
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    submit_type: "auto",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: CURRENCY,
        product_data: {
          name: data.title,
          description: data.description || data.shortDescription,
          images: data.thumbnail ? [data.thumbnail] : [],
        },
        unit_amount: formatAmountForStripe(data.price, CURRENCY),
      },
    }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    // Add metadata to track the course and user
    metadata: {
      courseId: data.courseId,
      courseName: data.title,
    },
    // Optional: Add customer email if you have it
    customer_email: data.customerEmail || undefined,
  });

  console.log('Stripe checkout session created:', {
    sessionId: checkoutSession.id,
    url: checkoutSession.url
  });

  return {
    client_secret: checkoutSession.client_secret,
    url: checkoutSession.url,
  }
}