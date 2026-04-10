'use client';

import { useState, useEffect } from 'react';
import type { Tier, BillingCycle } from '../../lib/constants';
import FAQ from '../components/FAQ';

const PLANS: {
  tier: Tier;
  name: string;
  badge?: string;
  features: string[];
}[] = [
  {
    tier: 'essential',
    name: 'Essential',
    features: [
      'Speech-to-text for clinical notes',
      'Supports one device per user',
      'Advanced medical vocabulary',
      'Macros, phrases, and templates',
      'Free updates',
      'Live chat & email support',
    ],
  },
  {
    tier: 'standard',
    name: 'Standard',
    badge: 'Most Popular',
    features: [
      'All Essential features, plus:',
      'AI Medical Scribe: SOAP notes',
      'Upload pre-recorded audio',
      'Up to three devices per user',
      'Priority support: 4hr response',
      'Free updates',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    features: [
      'All Standard features, plus:',
      'Doctor-patient interaction comprehension',
      'AI-assisted summarization & insights',
      'Superbill creation',
      'Enhanced dashboard',
      'Continuous feature upgrades',
    ],
  },
];

const FALLBACK_PRICES: Record<string, Record<string, number>> = {
  essential: { monthly: 199, yearly: 149 },
  standard: { monthly: 299, yearly: 249 },
  pro: { monthly: 399, yearly: 349 },
};

export default function PlanSelector() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [loadingTier, setLoadingTier] = useState<Tier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, Record<string, number>>>(FALLBACK_PRICES);

  useEffect(() => {
    fetch('/api/prices')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setPrices(data))
      .catch(() => {});
  }, []);

  const isYearly = billingCycle === 'yearly';
  const trialDays = isYearly ? 14 : 7;

  async function handleSelectPlan(tier: Tier) {
    setError(null);
    setLoadingTier(tier);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billingCycle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout session.');
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a5eb8] via-primary to-[#1a8aef] pb-32 pt-16 text-center text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-4">
          <p className="mb-3 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
            No credit card required to start
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Start Your Free Trial
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg opacity-90">
            Choose the plan that fits your practice. Upgrade, downgrade, or cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur-sm">
            <span className={`text-sm font-semibold transition-colors ${!isYearly ? 'text-white' : 'text-white/50'}`}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isYearly}
              aria-label="Toggle yearly billing"
              onClick={() => setBillingCycle(isYearly ? 'monthly' : 'yearly')}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent ${isYearly ? 'bg-white' : 'bg-white/30'}`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full shadow-md transition-transform ${isYearly ? 'translate-x-5 bg-primary' : 'translate-x-0 bg-white'}`}
              />
            </button>
            <span className={`text-sm font-semibold transition-colors ${isYearly ? 'text-white' : 'text-white/50'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="rounded-full bg-emerald-400 px-2.5 py-0.5 text-xs font-bold text-emerald-950">
                Save 25%
              </span>
            )}
          </div>

          <p className="mt-4 text-sm text-white/70">
            {trialDays}-day free trial on all plans · No setup fees
          </p>
        </div>
      </section>

      {/* Plan cards — pulled up over the hero */}
      <section className="relative z-10 -mt-24 px-4 pb-16">
        <div className="mx-auto max-w-6xl">
          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mx-auto mb-6 flex max-w-xl items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm text-red-700 shadow-sm"
            >
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="font-semibold underline hover:text-red-900">
                Dismiss
              </button>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => {
              const price = prices[plan.tier]?.[billingCycle] ?? 0;
              const isLoading = loadingTier === plan.tier;
              const isPopular = plan.tier === 'standard';

              return (
                <div
                  key={plan.tier}
                  className={`relative flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 ${
                    isPopular
                      ? 'ring-2 ring-primary shadow-xl shadow-primary/10'
                      : 'border border-gray-200 shadow-lg shadow-gray-200/50 hover:shadow-xl'
                  }`}
                >
                  {/* Popular badge */}
                  {plan.badge && (
                    <div className="absolute right-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-md">
                      {plan.badge}
                    </div>
                  )}

                  {/* Pricing header */}
                  <div className={`px-7 pb-6 pt-8 ${isPopular ? 'bg-gradient-to-b from-primary/[0.03] to-transparent' : ''}`}>
                    <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-5xl font-bold tracking-tight text-gray-900">${price}</span>
                      <span className="text-base text-gray-500">/mo</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      per provider · billed {isYearly ? 'yearly' : 'monthly'}
                    </p>

                    <button
                      onClick={() => handleSelectPlan(plan.tier)}
                      disabled={loadingTier !== null}
                      className={`mt-6 w-full rounded-xl px-4 py-3.5 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                        isPopular
                          ? 'bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 focus:ring-primary'
                          : 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900'
                      }`}
                    >
                      {isLoading ? (
                        <span className="inline-flex items-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Redirecting…
                        </span>
                      ) : (
                        'Start Free Trial'
                      )}
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="mx-7 border-t border-gray-100" />

                  {/* Features */}
                  <ul className="flex-1 space-y-3.5 px-7 py-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                    <li className="flex items-start gap-3 text-sm font-semibold text-primary">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {trialDays}-day free trial included
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-center text-sm text-gray-400">
            No setup fees · No contract · Cancel anytime
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            HIPAA Compliant
          </span>
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256-bit SSL Encryption
          </span>
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Powered by Stripe
          </span>
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Made with ♥ in NYC
          </span>
        </div>
      </section>

      <FAQ />
    </main>
  );
}
