import { POST } from './route';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { PRICE_IDS, TRIAL_PERIODS } from '../../../../lib/constants';

// Mock Stripe
jest.mock('stripe', () => {
  const mockCreate = jest.fn();
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockCreate,
      },
    },
  }));
});

function getStripeMock() {
  const StripeConstructor = Stripe as unknown as jest.Mock;
  const instance = StripeConstructor.mock.results[0].value;
  return instance.checkout.sessions.create as jest.Mock;
}

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin: 'http://localhost:3000' },
    body: JSON.stringify(body),
  });
}

describe('/api/create-checkout-session', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = getStripeMock();
    mockCreate.mockReset();
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/test-session' });
  });

  it('returns 400 for invalid tier', async () => {
    const res = await POST(makeRequest({ tier: 'invalid', billingCycle: 'monthly' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid tier');
  });

  it('returns 400 for invalid billingCycle', async () => {
    const res = await POST(makeRequest({ tier: 'essential', billingCycle: 'weekly' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid billing cycle');
  });

  it('creates a checkout session with correct params for essential/monthly', async () => {
    const res = await POST(makeRequest({ tier: 'essential', billingCycle: 'monthly' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe('https://checkout.stripe.com/test-session');

    expect(mockCreate).toHaveBeenCalledWith({
      mode: 'subscription',
      line_items: [
        {
          price: PRICE_IDS.essential.monthly,
          quantity: 1,
          adjustable_quantity: { enabled: true, minimum: 1, maximum: 14 },
        },
      ],
      subscription_data: { trial_period_days: TRIAL_PERIODS.monthly },
      success_url: 'http://localhost:3000/onboarding?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/',
    });
  });

  it('creates a checkout session with correct params for pro/yearly', async () => {
    const res = await POST(makeRequest({ tier: 'pro', billingCycle: 'yearly' }));
    expect(res.status).toBe(200);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({ price: PRICE_IDS.pro.yearly }),
        ],
        subscription_data: { trial_period_days: TRIAL_PERIODS.yearly },
      })
    );
  });

  it('returns 500 when Stripe throws', async () => {
    mockCreate.mockRejectedValue(new Error('Stripe error'));
    const res = await POST(makeRequest({ tier: 'standard', billingCycle: 'monthly' }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain('Failed to create checkout session');
  });
});
