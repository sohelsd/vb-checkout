'use client';

import { useState } from 'react';
import Link from 'next/link';

const NAV_ITEMS = [
  { label: 'Medical', href: 'https://voiceboxmd.com/medical-dictation/' },
  { label: 'Dental', href: 'https://voiceboxmd.com/dental-dictation-software/' },
  { label: 'AI Scribe', href: 'https://voiceboxmd.com/ai-scribe-software-for-physicians-ambient-dictation-modes/' },
  {
    label: 'Features',
    href: 'https://voiceboxmd.com/medical-dictation-features/',
    children: [
      { label: 'Supported EHR', href: 'https://voiceboxmd.com/ehr-emr-dictation/' },
      { label: 'Technology', href: 'https://voiceboxmd.com/medical-dictation-features/technology/' },
      { label: 'Vocabulary', href: 'https://voiceboxmd.com/medical-dictation-features/vocabulary/' },
      { label: 'Templates', href: 'https://voiceboxmd.com/medical-dictation-features/templates/' },
      { label: 'Mobile', href: 'https://voiceboxmd.com/medical-dictation-features/mobile-dictation/' },
      { label: 'Artificial Intelligence (AI)', href: 'https://voiceboxmd.com/medical-dictation-features/ai-dictation-tool-for-doctors/' },
    ],
  },
  { label: 'Pricing', href: 'https://voiceboxmd.com/pricing/' },
];

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <a
          href="https://voiceboxmd.com/"
          className="text-xl font-bold tracking-tight text-primary"
        >
          VoiceboxMD
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label} className="relative">
                <button
                  type="button"
                  onClick={() => setFeaturesOpen(!featuresOpen)}
                  onBlur={() => setTimeout(() => setFeaturesOpen(false), 150)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-primary"
                  aria-haspopup="true"
                  aria-expanded={featuresOpen}
                >
                  {item.label}
                  <svg
                    className={`h-3.5 w-3.5 transition-transform ${featuresOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {featuresOpen && (
                  <ul className="absolute left-0 top-full mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <a
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        {/* Desktop CTA */}
        <Link
          href="/"
          className="hidden rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-primary/90 lg:inline-block"
        >
          Try Now
        </Link>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-1.5 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className={`block h-0.5 w-6 bg-gray-700 transition-transform ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-6 bg-gray-700 transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-gray-700 transition-transform ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-gray-100 bg-white px-4 pb-4 lg:hidden" aria-label="Mobile navigation">
          <ul className="space-y-1 pt-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setFeaturesOpen(!featuresOpen)}
                      className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-700"
                    >
                      {item.label}
                      <svg
                        className={`h-4 w-4 transition-transform ${featuresOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {featuresOpen && (
                      <ul className="ml-4 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <a
                              href={child.href}
                              className="block py-1.5 text-sm text-gray-600 hover:text-primary"
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <a
                    href={item.href}
                    className="block py-2 text-sm font-medium text-gray-700 hover:text-primary"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/"
                className="block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-bold text-white"
              >
                Try Now
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
