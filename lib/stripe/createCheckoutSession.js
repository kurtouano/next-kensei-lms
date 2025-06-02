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

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    submit_type: "auto",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: CURRENCY,
        product_data: {
          name: data.title,
          description: data.description,
          images: data.thumbnail ? [data.thumbnail] : [],
        },
        unit_amount: formatAmountForStripe(data.price, CURRENCY),
      },
    }],
    success_url: `${origin}/courses/enroll-success?session_id={CHECKOUT_SESSION_ID}&courseId=${data.courseId}`,
    cancel_url: `${origin}/courses`,
  });

  return {
    client_secret: checkoutSession.client_secret,
    url: checkoutSession.url,
  }
}