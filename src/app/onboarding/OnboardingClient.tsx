'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ValidatedSession } from './page';
import OnboardingForm from '../../components/OnboardingForm';

interface OnboardingClientProps {
  sessionId: string;
  sessionData: ValidatedSession;
}

const STORAGE_KEY_PREFIX = 'onboarding_completed_';

export default function OnboardingClient({
  sessionId,
  sessionData,
}: OnboardingClientProps) {
  const router = useRouter();
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleSuccess = useCallback(
    (data: { adminId: number; userEmails: string[]; organizationName: string }) => {
      // Mark session as completed
      const key = `${STORAGE_KEY_PREFIX}${sessionId}`;
      sessionStorage.setItem(key, 'true');

      // Store response data for the confirmation page
      sessionStorage.setItem('onboarding_result', JSON.stringify(data));

      router.push('/confirmation');
    },
    [sessionId, router],
  );

  useEffect(() => {
    const key = `${STORAGE_KEY_PREFIX}${sessionId}`;
    if (sessionStorage.getItem(key) === 'true') {
      setAlreadyCompleted(true);
    }
    setChecked(true);
  }, [sessionId]);

  if (!checked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  if (alreadyCompleted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-7 w-7 text-green-600"
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
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Onboarding Already Completed
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            This checkout session has already been used to complete onboarding.
            If you need help, contact{' '}
            <a
              href="mailto:support@voiceboxmd.com"
              className="font-medium text-primary underline"
            >
              support@voiceboxmd.com
            </a>
            .
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href="https://docs.voiceboxmd.com"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            >
              Download VoiceboxMD
            </a>
            <a
              href="https://admin.voiceboxmd.com"
              className="rounded-lg border border-primary px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
            >
              Go to Admin Portal
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-primary py-10 text-center text-white">
        <h1 className="text-3xl font-bold tracking-wide md:text-4xl">
          Complete Your Setup
        </h1>
        <p className="mt-2 text-base opacity-90">
          {{ essential: 'Essential', standard: 'Professional', pro: 'Premium' }[sessionData.tier]} Plan ·{' '}
          {sessionData.seatQuantity} {sessionData.seatQuantity === 1 ? 'seat' : 'seats'} ·{' '}
          Billed {sessionData.billingCycle}
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <OnboardingForm
          subscriptionId={sessionData.subscriptionId}
          customerId={sessionData.customerId}
          customerEmail={sessionData.customerEmail}
          customerName={sessionData.customerName}
          tier={sessionData.tier}
          billingCycle={sessionData.billingCycle}
          seatQuantity={sessionData.seatQuantity}
          onSuccess={handleSuccess}
        />
      </div>
    </main>
  );
}
