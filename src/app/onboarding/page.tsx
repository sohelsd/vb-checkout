import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { PRICE_TO_TIER } from '../../../lib/constants';
import type { Tier, BillingCycle } from '../../../lib/constants';
import OnboardingClient from './OnboardingClient';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export interface ValidatedSession {
  subscriptionId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  seatQuantity: number;
  tier: Tier;
  billingCycle: BillingCycle;
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === 'string' ? params.session_id : undefined;

  if (!sessionId) {
    redirect('/');
  }

  let sessionData: ValidatedSession;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid') {
      redirect('/');
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);

    const subscription = session.subscription;
    const subscriptionId =
      typeof subscription === 'string' ? subscription : subscription?.id;

    const customer = session.customer;
    const customerId =
      typeof customer === 'string' ? customer : customer?.id;

    if (!subscriptionId || !customerId) {
      redirect('/');
    }

    const firstLineItem = lineItems.data[0];
    const seatQuantity = firstLineItem?.quantity ?? 1;
    const priceId = firstLineItem?.price?.id;

    if (!priceId || !PRICE_TO_TIER[priceId]) {
      redirect('/');
    }

    const { tier, billingCycle } = PRICE_TO_TIER[priceId];

    sessionData = {
      subscriptionId,
      customerId,
      customerEmail: session.customer_details?.email || session.customer_email || '',
      customerName: session.customer_details?.name || '',
      seatQuantity,
      tier,
      billingCycle,
    };
  } catch {
    redirect('/');
  }

  return (
    <OnboardingClient sessionId={sessionId} sessionData={sessionData} />
  );
}
