import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PRICE_IDS, TRIAL_PERIODS, TIERS, BILLING_CYCLES, type Tier, type BillingCycle } from '../../../../lib/constants';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, billingCycle } = body;

    // Validate tier
    if (!TIERS.includes(tier)) {
      return NextResponse.json(
        { error: `Invalid tier. Must be one of: ${TIERS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate billingCycle
    if (!BILLING_CYCLES.includes(billingCycle)) {
      return NextResponse.json(
        { error: `Invalid billing cycle. Must be one of: ${BILLING_CYCLES.join(', ')}` },
        { status: 400 }
      );
    }

    const validTier = tier as Tier;
    const validCycle = billingCycle as BillingCycle;

    // Look up Stripe Price ID
    const priceId = PRICE_IDS[validTier][validCycle];

    // Build success and cancel URLs
    const origin = request.headers.get('origin') || request.nextUrl.origin;
    const successUrl = `${origin}/onboarding?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/`;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
            maximum: 14,
          },
        },
      ],
      subscription_data: {
        trial_period_days: TRIAL_PERIODS[validCycle],
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    );
  }
}
