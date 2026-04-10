import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PRICE_TO_TIER } from '../../../../lib/constants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing session_id query parameter' },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    // Also retrieve line_items separately since they require a list call
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 402 }
      );
    }

    // Extract subscription ID
    const subscription = session.subscription;
    const subscriptionId =
      typeof subscription === 'string' ? subscription : subscription?.id;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'No subscription found for this session' },
        { status: 400 }
      );
    }

    // Extract customer ID
    const customer = session.customer;
    const customerId =
      typeof customer === 'string' ? customer : customer?.id;

    if (!customerId) {
      return NextResponse.json(
        { error: 'No customer found for this session' },
        { status: 400 }
      );
    }

    // Extract seat quantity from line items
    const firstLineItem = lineItems.data[0];
    const seatQuantity = firstLineItem?.quantity ?? 1;

    // Extract price ID and do reverse lookup for tier + billing cycle
    const priceId = firstLineItem?.price?.id;

    if (!priceId || !PRICE_TO_TIER[priceId]) {
      return NextResponse.json(
        { error: 'Unknown price ID in session' },
        { status: 400 }
      );
    }

    const { tier, billingCycle } = PRICE_TO_TIER[priceId];

    return NextResponse.json({
      subscriptionId,
      customerId,
      seatQuantity,
      tier,
      billingCycle,
    });
  } catch (error) {
    console.error('Error validating session:', error);
    return NextResponse.json(
      { error: 'Failed to validate session. Please try again.' },
      { status: 500 }
    );
  }
}
