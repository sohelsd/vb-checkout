'use client';

import { useState } from 'react';
import type { Tier, BillingCycle } from '../../lib/constants';

const PLANS: {
  tier: Tier;
  name: string;
  features: string[];
  monthly: number;
  yearly: number;
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
    monthly: 199,
    yearly: 149,
  },
  {
    tier: 'standard',
    name: 'Standard',
    features: [
      'All Essential features, plus:',
      'AI Medical Scribe: SOAP notes',
      'Upload pre-recorded audio',
      'Up to three devices per user',
      'Priority support: 4hr response',
      'Free updates',
    ],
    monthly: 299,
    yearly: 249,
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
    monthly: 399,
    yearly: 349,
  },
];

export default function PlanSelector() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [loadingTier, setLoadingTier] = useState<Tier | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session.');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary py-10 text-center text-white">
        <h1 className="text-3xl font-bold tracking-wide md:text-4xl">
          Start My Free Trial
        </h1>
        <p className="mt-2 text-base opacity-90">
          SELECT PLAN – PER PROVIDER
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Billing toggle */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <span
            className={`text-sm font-semibold ${!isYearly ? 'text-primary' : 'text-gray-500'}`}
          >
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isYearly}
            aria-label="Toggle yearly billing"
            onClick={() =>
              setBillingCycle(isYearly ? 'monthly' : 'yearly')
            }
            className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 data-[checked]:bg-primary"
            data-checked={isYearly ? '' : undefined}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition-transform ${
                isYearly ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-sm font-semibold ${isYearly ? 'text-primary' : 'text-gray-500'}`}
          >
            Yearly
          </span>
          {isYearly && (
            <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Save more
            </span>
          )}
        </div>

        <p className="mb-8 text-center text-sm text-gray-500">
          No charge for the first {trialDays} days on all plans.
        </p>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mx-auto mb-6 flex max-w-xl items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="font-medium underline hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const price = isYearly ? plan.yearly : plan.monthly;
            const isLoading = loadingTier === plan.tier;

            return (
              <div
                key={plan.tier}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                {/* Card header */}
                <div className="bg-primary px-6 py-5 text-center text-white">
                  <h2 className="text-xl font-bold">{plan.name}</h2>
                  <p className="mt-2 text-3xl font-bold">
                    ${price}
                    <span className="text-base font-normal opacity-80">
                      /mo
                    </span>
                  </p>
                  <p className="mt-1 text-sm opacity-80">
                    per provider · billed {isYearly ? 'yearly' : 'monthly'}
                  </p>
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-3 px-6 py-5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-sm font-medium text-primary">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {trialDays}-day free trial
                  </li>
                </ul>

                {/* CTA */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => handleSelectPlan(plan.tier)}
                    disabled={loadingTier !== null}
                    className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? 'Redirecting…' : 'Start Free Trial'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          No setup fees · No contract · Cancel anytime
        </p>
      </div>
    </main>
  );
}
