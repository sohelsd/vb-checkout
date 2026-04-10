import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PRICE_IDS, TIERS, BILLING_CYCLES } from '../../../../lib/constants';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function GET() {
  try {
    const stripe = getStripe();

    // Fetch each price directly by ID (avoids pagination issues with list)
    const fetchPromises: { tier: string; cycle: string; promise: Promise<Stripe.Price> }[] = [];

    for (const tier of TIERS) {
      for (const cycle of BILLING_CYCLES) {
        const priceId = PRICE_IDS[tier][cycle];
        fetchPromises.push({
          tier,
          cycle,
          promise: stripe.prices.retrieve(priceId),
        });
      }
    }

    const results = await Promise.all(fetchPromises.map((p) => p.promise));

    // Debug: log the first price to see its structure
    if (results.length > 0) {
      console.log('Sample Stripe price object:', JSON.stringify({
        id: results[0].id,
        unit_amount: results[0].unit_amount,
        unit_amount_decimal: results[0].unit_amount_decimal,
        billing_scheme: results[0].billing_scheme,
        tiers_mode: results[0].tiers_mode,
        transform_quantity: results[0].transform_quantity,
        recurring: results[0].recurring,
        type: results[0].type,
      }));
    }

    // Build the response: tier → { monthly, yearly } in dollars
    const response: Record<string, Record<string, number>> = {};

    fetchPromises.forEach(({ tier, cycle }, index) => {
      if (!response[tier]) response[tier] = {};

      const stripePrice = results[index];
      if (stripePrice && stripePrice.unit_amount != null) {
        const amount = stripePrice.unit_amount / 100;
        // For yearly prices billed annually, show the per-month equivalent
        if (cycle === 'yearly' && stripePrice.recurring?.interval === 'year') {
          response[tier][cycle] = Math.round(amount / 12);
        } else {
          response[tier][cycle] = amount;
        }
      } else {
        response[tier][cycle] = 0;
      }
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
