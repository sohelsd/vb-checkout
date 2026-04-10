import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PRICE_IDS, TIERS, BILLING_CYCLES } from '../../../../lib/constants';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function GET() {
  try {
    const stripe = getStripe();

    // Fetch each price with tiers expanded (needed for volume/tiered pricing)
    const fetchPromises: { tier: string; cycle: string; promise: Promise<Stripe.Price> }[] = [];

    for (const tier of TIERS) {
      for (const cycle of BILLING_CYCLES) {
        const priceId = PRICE_IDS[tier][cycle];
        fetchPromises.push({
          tier,
          cycle,
          promise: stripe.prices.retrieve(priceId, { expand: ['tiers'] }),
        });
      }
    }

    const results = await Promise.all(fetchPromises.map((p) => p.promise));

    // Build the response: tier → { monthly, yearly } in dollars
    const response: Record<string, Record<string, number>> = {};

    fetchPromises.forEach(({ tier, cycle }, index) => {
      if (!response[tier]) response[tier] = {};

      const stripePrice = results[index];
      let amount = 0;

      if (stripePrice.unit_amount != null) {
        // Flat pricing
        amount = stripePrice.unit_amount / 100;
      } else if (stripePrice.tiers && stripePrice.tiers.length > 0) {
        // Tiered/volume pricing — use the first tier's unit_amount
        const firstTier = stripePrice.tiers[0];
        if (firstTier.unit_amount != null) {
          amount = firstTier.unit_amount / 100;
        }
      }

      // For yearly prices billed annually, show the per-month equivalent
      if (cycle === 'yearly' && stripePrice.recurring?.interval === 'year' && amount > 0) {
        amount = Math.round(amount / 12);
      }

      response[tier][cycle] = amount;
    });

    return NextResponse.json(response, {
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
