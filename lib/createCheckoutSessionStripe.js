import { headers } from 'next/headers';
import { formatAmountForStripe } from './stripe-helper';
import { stripe } from './stripe';

const CURRENCY = 'usd'; 

export async function createCheckoutSession(data) {
    const ui_mode = "hosted";
    
    // ✅ Fix: headers() returns the headers object directly
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
                    images: data.thumbnail ? [data.thumbnail] : [], // ✅ Fix: handle undefined thumbnail
                },
                unit_amount: formatAmountForStripe(data.price, CURRENCY),
            },
        }],

        // ✅ Simplified - remove the conditional spread
        success_url: `${origin}/courses/enroll-success?session_id={CHECKOUT_SESSION_ID}&courseId=${data.courseId}`,
        cancel_url: `${origin}/courses`,
    });

    return {
        client_secret: checkoutSession.client_secret,
        url: checkoutSession.url,
    }
}

export async function createPaymentIntent(data) {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: formatAmountForStripe(data.price, CURRENCY),
        currency: CURRENCY,
        automatic_payment_methods: {enabled: true},
    });

    return {
        client_secret: paymentIntent.client_secret,
    };
}