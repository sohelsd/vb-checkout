'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingResult {
  adminId: number;
  userEmails: string[];
  organizationName: string;
}

function getTemporaryPassword(): string {
  const yy = (new Date().getFullYear() % 100).toString().padStart(2, '0');
  return `FreePeople${yy}`;
}

export default function ConfirmationPage() {
  const router = useRouter();
  const [data, setData] = useState<OnboardingResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('onboarding_result');
    if (!raw) {
      router.replace('/');
      return;
    }
    try {
      setData(JSON.parse(raw) as OnboardingResult);
    } catch {
      router.replace('/');
    }
  }, [router]);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  const tempPassword = getTemporaryPassword();
  const adminEmail = data.userEmails[0] ?? '';

  return (
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-primary py-10 text-center text-white">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-wide md:text-4xl">
            Your trial has started
          </h1>
          <p className="mt-2 text-base opacity-90">
            Follow these steps to begin using VoiceboxMD
          </p>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-2xl px-4 py-10">
          {/* Step 1: Download */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-gray-900">
              <span className="text-primary">Step 1</span> — Download the software
            </h2>
            <p className="text-sm text-gray-600">
              Visit{' '}
              <a
                href="https://docs.voiceboxmd.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline"
              >
                docs.voiceboxmd.com
              </a>{' '}
              to download VoiceboxMD for Windows, Mac, or Mobile.
            </p>
          </div>

          {/* Step 2: Login credentials */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-gray-900">
              <span className="text-primary">Step 2</span> — Log in to your account
            </h2>
            <p className="mb-3 text-sm text-gray-600">
              Use your email and the temporary password below to sign in:
            </p>

            <div className="mb-3 rounded-lg bg-gray-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                User Emails
              </p>
              <ul className="list-inside list-disc text-sm text-gray-800">
                {data.userEmails.map((email) => (
                  <li key={email}>{email}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-primary/5 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Temporary Password
              </p>
              <p className="text-lg font-bold text-primary">{tempPassword}</p>
            </div>
          </div>

          {/* Step 3: Admin portal */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-gray-900">
              <span className="text-primary">Step 3</span> — Manage your seats
            </h2>
            <p className="text-sm text-gray-600">
              Account admin{' '}
              <span className="font-semibold text-gray-800">{adminEmail}</span> can
              manage seats at{' '}
              <a
                href="https://admin.voiceboxmd.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline"
              >
                admin.voiceboxmd.com
              </a>
            </p>
          </div>

          {/* Step 4: Calendly */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-gray-900">
              <span className="text-primary">Step 4</span>{' '}
              <span className="text-gray-500">(optional)</span> — Schedule a consultation
            </h2>
            <p className="mb-3 text-sm text-gray-600">
              Explore the software and ensure a smooth onboarding experience with our team.
            </p>
            <a
              href="https://calendly.com/rahil-voiceboxmd/voiceboxmd-setup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            >
              Schedule a Call
            </a>
          </div>

          {/* Note */}
          <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <p className="text-sm text-gray-700">
              👍 Please note: The admin account uses the same default temporary password{' '}
              <span className="font-bold">{tempPassword}</span>.
            </p>
          </div>
        </div>
      </main>
  );
}
