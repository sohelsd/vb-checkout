// Subscription tiers
export const TIERS = ['essential', 'standard', 'pro'] as const;
export type Tier = (typeof TIERS)[number];

// Billing cycles
export const BILLING_CYCLES = ['monthly', 'yearly'] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

// Trial period constants (in days)
export const TRIAL_PERIODS: Record<BillingCycle, number> = {
  monthly: 7,
  yearly: 14,
};

// Forward mapping: tier + billingCycle → Stripe Price ID
export const PRICE_IDS: Record<Tier, Record<BillingCycle, string>> = {
  essential: {
    monthly: 'price_1RpmwrFGXmeLj20AZqJ5uK3b',
    yearly: 'price_1SCipvFGXmeLj20AuotD12Ac',
  },
  standard: {
    monthly: 'price_1KYgZvFGXmeLj20ArdwEZViE',
    yearly: 'price_1KYgZvFGXmeLj20AYWKrGeiw',
  },
  pro: {
    monthly: 'price_1SDHJMFGXmeLj20AvV1Zi7yN',
    yearly: 'price_1SDHKMFGXmeLj20AzS5Sk9lW',
  },
};

// Reverse mapping: Price ID → tier + billingCycle
export const PRICE_TO_TIER: Record<string, { tier: Tier; billingCycle: BillingCycle }> = {
  'price_1RpmwrFGXmeLj20AZqJ5uK3b': { tier: 'essential', billingCycle: 'monthly' },
  'price_1SCipvFGXmeLj20AuotD12Ac': { tier: 'essential', billingCycle: 'yearly' },
  'price_1KYgZvFGXmeLj20ArdwEZViE': { tier: 'standard', billingCycle: 'monthly' },
  'price_1KYgZvFGXmeLj20AYWKrGeiw': { tier: 'standard', billingCycle: 'yearly' },
  'price_1SDHJMFGXmeLj20AvV1Zi7yN': { tier: 'pro', billingCycle: 'monthly' },
  'price_1SDHKMFGXmeLj20AzS5Sk9lW': { tier: 'pro', billingCycle: 'yearly' },
};
