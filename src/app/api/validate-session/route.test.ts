import { GET } from './route';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe', () => {
  const mockRetrieve = jest.fn();
  const mockListLineItems = jest.fn();
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        retrieve: mockRetrieve,
        listLineItems: mockListLineItems,
      },
    },
  }));
});

function getStripeMocks() {
  const StripeConstructor = Stripe as unknown as jest.Mock;
  const instance = StripeConstructor.mock.results[0].value;
  return {
    retrieve: instance.checkout.sessions.retrieve as jest.Mock,
    listLineItems: instance.checkout.sessions.listLineItems as jest.Mock,
  };
}

function makeRequest(sessionId?: string): NextRequest {
  const url = sessionId
    ? `http://localhost:3000/api/validate-session?session_id=${sessionId}`
    : 'http://localhost:3000/api/validate-session';
  return new NextRequest(url, { method: 'GET' });
}

function makePaidSession(overrides: Record<string, unknown> = {}) {
  return {
    payment_status: 'paid',
    subscription: 'sub_test123',
    customer: 'cus_test456',
    ...overrides,
  };
}

function makeLineItems(priceId: string, quantity: number) {
  return {
    data: [
      {
        price: { id: priceId },
        quantity,
      },
    ],
  };
}

describe('/api/validate-session', () => {
  let mocks: ReturnType<typeof getStripeMocks>;

  beforeEach(() => {
    mocks = getStripeMocks();
    mocks.retrieve.mockReset();
    mocks.listLineItems.mockReset();
  });

  it('returns 400 when session_id is missing', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Missing session_id');
  });

  it('returns 402 when payment_status is not paid', async () => {
    mocks.retrieve.mockResolvedValue({ payment_status: 'unpaid' });
    mocks.listLineItems.mockResolvedValue({ data: [] });

    const res = await GET(makeRequest('cs_test_abc'));
    expect(res.status).toBe(402);
    const json = await res.json();
    expect(json.error).toContain('Payment not completed');
  });

  it('returns validated session data for a paid session', async () => {
    mocks.retrieve.mockResolvedValue(makePaidSession());
    mocks.listLineItems.mockResolvedValue(
      makeLineItems('price_1KYgZvFGXmeLj20ArdwEZViE', 3)
    );

    const res = await GET(makeRequest('cs_test_abc'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      subscriptionId: 'sub_test123',
      customerId: 'cus_test456',
      seatQuantity: 3,
      tier: 'standard',
      billingCycle: 'monthly',
    });
  });

  it('handles expanded subscription object', async () => {
    mocks.retrieve.mockResolvedValue(
      makePaidSession({ subscription: { id: 'sub_expanded' } })
    );
    mocks.listLineItems.mockResolvedValue(
      makeLineItems('price_1SDHKMFGXmeLj20AzS5Sk9lW', 5)
    );

    const res = await GET(makeRequest('cs_test_abc'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.subscriptionId).toBe('sub_expanded');
    expect(json.tier).toBe('pro');
    expect(json.billingCycle).toBe('yearly');
    expect(json.seatQuantity).toBe(5);
  });

  it('handles expanded customer object', async () => {
    mocks.retrieve.mockResolvedValue(
      makePaidSession({ customer: { id: 'cus_expanded' } })
    );
    mocks.listLineItems.mockResolvedValue(
      makeLineItems('price_1RpmwrFGXmeLj20AZqJ5uK3b', 1)
    );

    const res = await GET(makeRequest('cs_test_abc'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.customerId).toBe('cus_expanded');
  });

  it('returns 400 when subscription is missing', async () => {
    mocks.retrieve.mockResolvedValue(
      makePaidSession({ subscription: null })
    );
    mocks.listLineItems.mockResolvedValue(
      makeLineItems('price_1RpmwrFGXmeLj20AZqJ5uK3b', 1)
    );

    const res = await GET(makeRequest('cs_test_abc'));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('No subscription found');
  });

  it('returns 400 when customer is missing', async () => {
    mocks.retrieve.mockResolvedValue(
      makePaidSession({ customer: null })
    );
    mocks.listLineItems.mockResolvedValue(
      makeLineItems('price_1RpmwrFGXmeLj20AZqJ5uK3b', 1)
    );

    const res = await GET(makeRequest('cs_test_abc'));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('No customer found');
  });

  it('returns 400 for unknown price ID', async () => {
    mocks.retrieve.mockResolvedValue(makePaidSession());
    mocks.listLineItems.mockResolvedValue(
      makeLineItems('price_unknown', 1)
    );

    const res = await GET(makeRequest('cs_test_abc'));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Unknown price ID');
  });

  it('returns 500 when Stripe throws', async () => {
    mocks.retrieve.mockRejectedValue(new Error('Stripe error'));

    const res = await GET(makeRequest('cs_test_abc'));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain('Failed to validate session');
  });
});
