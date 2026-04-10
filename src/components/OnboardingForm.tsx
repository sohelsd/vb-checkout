'use client';

import { useState, useCallback } from 'react';

const TITLE_OPTIONS = ['Dr.', 'Mr.', 'Mrs.', 'Ms.'] as const;

interface AdminInfo {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
}

interface UserInfo {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface OnboardingFormProps {
  subscriptionId: string;
  customerId: string;
  tier: string;
  billingCycle: string;
  seatQuantity: number;
  onSuccess: (data: { adminId: number; userEmails: string[]; organizationName: string }) => void;
}

const INITIAL_ADMIN: AdminInfo = {
  title: 'Dr.',
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  phone: '',
};

function createInitialUser(): UserInfo {
  return { title: 'Dr.', firstName: '', lastName: '', email: '' };
}

export default function OnboardingForm({
  subscriptionId,
  customerId,
  tier,
  billingCycle,
  seatQuantity,
  onSuccess,
}: OnboardingFormProps) {
  const [admin, setAdmin] = useState<AdminInfo>(INITIAL_ADMIN);
  const [users, setUsers] = useState<UserInfo[]>(() =>
    Array.from({ length: seatQuantity }, () => createInitialUser()),
  );
  const [sameAsAdmin, setSameAsAdmin] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateAdmin = useCallback(
    (field: keyof AdminInfo, value: string) => {
      setAdmin((prev) => {
        const next = { ...prev, [field]: value };
        // If "same as admin" is checked, sync first user
        if (sameAsAdmin) {
          setUsers((prevUsers) => {
            const copy = [...prevUsers];
            copy[0] = {
              title: next.title,
              firstName: next.firstName,
              lastName: next.lastName,
              email: next.email,
            };
            return copy;
          });
        }
        return next;
      });
      // Clear field error on change
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`admin.${field}`];
        return next;
      });
    },
    [sameAsAdmin],
  );

  const updateUser = useCallback((index: number, field: keyof UserInfo, value: string) => {
    setUsers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`users.${index}.${field}`];
      return next;
    });
  }, []);

  const handleSameAsAdmin = useCallback(
    (checked: boolean) => {
      setSameAsAdmin(checked);
      if (checked) {
        setUsers((prev) => {
          const copy = [...prev];
          copy[0] = {
            title: admin.title,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
          };
          return copy;
        });
      }
    },
    [admin],
  );

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    // Admin fields — all required
    if (!admin.firstName.trim()) newErrors['admin.firstName'] = 'First name is required';
    if (!admin.lastName.trim()) newErrors['admin.lastName'] = 'Last name is required';
    if (!admin.email.trim()) newErrors['admin.email'] = 'Email is required';
    if (!admin.company.trim()) newErrors['admin.company'] = 'Company is required';
    if (!admin.phone.trim()) newErrors['admin.phone'] = 'Phone is required';

    // User fields — email required for all
    users.forEach((user, i) => {
      if (!user.email.trim()) newErrors[`users.${i}.email`] = 'Email is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      subscriptionId,
      customerId,
      tier,
      billingCycle,
      seatQuantity,
      admin,
      users,
    };

    try {
      const lambdaUrl = process.env.NEXT_PUBLIC_ONBOARDING_LAMBDA_URL;
      if (!lambdaUrl) {
        throw new Error('Onboarding service URL is not configured.');
      }

      const res = await fetch(lambdaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Onboarding failed. Please try again.');
      }

      onSuccess(data.data ?? data);
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setSubmitError('Unable to connect. Please check your internet connection and try again.');
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Submit error */}
      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span className="flex-1">{submitError}</span>
          <button
            type="button"
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            className="shrink-0 font-medium text-red-700 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Admin section */}
      <fieldset className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <legend className="px-2 text-lg font-bold text-gray-900">
          Admin Information
        </legend>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Title */}
          <div>
            <label htmlFor="admin-title" className="mb-1 block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <select
              id="admin-title"
              value={admin.title}
              onChange={(e) => updateAdmin('title', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {TITLE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Spacer on desktop */}
          <div className="hidden sm:block" />

          {/* First name */}
          <div>
            <label htmlFor="admin-firstName" className="mb-1 block text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              id="admin-firstName"
              type="text"
              value={admin.firstName}
              onChange={(e) => updateAdmin('firstName', e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                errors['admin.firstName']
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                  : 'border-gray-300 focus:border-primary focus:ring-primary'
              }`}
            />
            {errors['admin.firstName'] && (
              <p className="mt-1 text-xs text-red-600">{errors['admin.firstName']}</p>
            )}
          </div>

          {/* Last name */}
          <div>
            <label htmlFor="admin-lastName" className="mb-1 block text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              id="admin-lastName"
              type="text"
              value={admin.lastName}
              onChange={(e) => updateAdmin('lastName', e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                errors['admin.lastName']
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                  : 'border-gray-300 focus:border-primary focus:ring-primary'
              }`}
            />
            {errors['admin.lastName'] && (
              <p className="mt-1 text-xs text-red-600">{errors['admin.lastName']}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="admin-email" className="mb-1 block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="admin-email"
              type="email"
              value={admin.email}
              onChange={(e) => updateAdmin('email', e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                errors['admin.email']
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                  : 'border-gray-300 focus:border-primary focus:ring-primary'
              }`}
            />
            {errors['admin.email'] && (
              <p className="mt-1 text-xs text-red-600">{errors['admin.email']}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label htmlFor="admin-company" className="mb-1 block text-sm font-medium text-gray-700">
              Company / Practice Name <span className="text-red-500">*</span>
            </label>
            <input
              id="admin-company"
              type="text"
              value={admin.company}
              onChange={(e) => updateAdmin('company', e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                errors['admin.company']
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                  : 'border-gray-300 focus:border-primary focus:ring-primary'
              }`}
            />
            {errors['admin.company'] && (
              <p className="mt-1 text-xs text-red-600">{errors['admin.company']}</p>
            )}
          </div>

          {/* Phone */}
          <div className="sm:col-span-2">
            <label htmlFor="admin-phone" className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="admin-phone"
              type="tel"
              value={admin.phone}
              onChange={(e) => updateAdmin('phone', e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 sm:max-w-xs ${
                errors['admin.phone']
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                  : 'border-gray-300 focus:border-primary focus:ring-primary'
              }`}
            />
            {errors['admin.phone'] && (
              <p className="mt-1 text-xs text-red-600">{errors['admin.phone']}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Per-seat user sections */}
      {users.map((user, index) => (
        <fieldset
          key={index}
          data-testid={`user-section-${index}`}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <legend className="px-2 text-lg font-bold text-gray-900">
            User {index + 1}
          </legend>

          {/* Same as admin checkbox — first user only */}
          {index === 0 && (
            <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={sameAsAdmin}
                onChange={(e) => handleSameAsAdmin(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              Same as admin
            </label>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {/* Title */}
            <div>
              <label
                htmlFor={`user-${index}-title`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <select
                id={`user-${index}-title`}
                value={user.title}
                onChange={(e) => updateUser(index, 'title', e.target.value)}
                disabled={index === 0 && sameAsAdmin}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500"
              >
                {TITLE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Spacer */}
            <div className="hidden sm:block" />

            {/* First name */}
            <div>
              <label
                htmlFor={`user-${index}-firstName`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                id={`user-${index}-firstName`}
                type="text"
                value={user.firstName}
                onChange={(e) => updateUser(index, 'firstName', e.target.value)}
                disabled={index === 0 && sameAsAdmin}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            {/* Last name */}
            <div>
              <label
                htmlFor={`user-${index}-lastName`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                id={`user-${index}-lastName`}
                type="text"
                value={user.lastName}
                onChange={(e) => updateUser(index, 'lastName', e.target.value)}
                disabled={index === 0 && sameAsAdmin}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label
                htmlFor={`user-${index}-email`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id={`user-${index}-email`}
                type="email"
                value={user.email}
                onChange={(e) => updateUser(index, 'email', e.target.value)}
                disabled={index === 0 && sameAsAdmin}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 sm:max-w-md disabled:bg-gray-100 disabled:text-gray-500 ${
                  errors[`users.${index}.email`]
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                    : 'border-gray-300 focus:border-primary focus:ring-primary'
                }`}
              />
              {errors[`users.${index}.email`] && (
                <p className="mt-1 text-xs text-red-600">{errors[`users.${index}.email`]}</p>
              )}
            </div>
          </div>
        </fieldset>
      ))}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting…' : 'Complete Setup'}
      </button>
    </form>
  );
}
