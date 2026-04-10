import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PRICE_IDS, TIERS, BILLING_CYCLES, type Tier, type BillingCycle } from '../../../../lib/constants';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function GET() {
  try {
    const stripe = getStripe();
    // Collect all price IDs
    const allPriceIds: string[] = [];
    for (const tier of TIERS) {
      for (const cycle of BILLING_CYCLES) {
        allPriceIds.push(PRICE_IDS[tier][cycle]);
      }
    }

    // Fetch all prices from Stripe in one call
    const prices = await stripe.prices.list({
      limit: 100,
    });

    // Build a lookup map from the response
    const priceMap = new Map<string, Stripe.Price>();
    for (const price of prices.data) {
      if (allPriceIds.includes(price.id)) {
        priceMap.set(price.id, price);
      }
    }

    // Build the response: tier → { monthly, yearly } in dollars
    const result: Record<string, Record<string, number>> = {};

    for (const tier of TIERS) {
      result[tier] = {};
      for (const cycle of BILLING_CYCLES) {
        const priceId = PRICE_IDS[tier][cycle];
        const stripePrice = priceMap.get(priceId);

        if (stripePrice && stripePrice.unit_amount != null) {
          // Stripe amounts are in cents, convert to dollars
          // For yearly prices, show the per-month equivalent
          const amount = stripePrice.unit_amount / 100;
          if (cycle === 'yearly' && stripePrice.recurring?.interval === 'year') {
            result[tier][cycle] = Math.round(amount / 12);
          } else {
            result[tier][cycle] = amount;
          }
        } else {
          result[tier][cycle] = 0;
        }
      }
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
