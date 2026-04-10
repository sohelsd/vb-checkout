'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const GENERAL_FAQS: FAQItem[] = [
  {
    question: 'Will it work on my computer?',
    answer:
      'A Windows PC or Laptop or Mac OS X and good internet connection are the only requirements to run VoiceboxMD Advanced Medical Dictation. VoiceboxMD for Mobile is compatible with iOS 10.x and above. You can take the VoiceboxMD compatibility test to ensure the microphone you have is adequate for dictation. Chat with us if you have any questions.',
  },
  {
    question: 'How does it differ from the competition?',
    answer:
      'VoiceboxMD is built specifically for healthcare, not repurposed from generic dictation tools. Our engine is trained on real clinical language, so it understands medical terminology, abbreviations, and workflows in a way consumer speech software simply cannot. On top of fast, accurate speech-to-text, you get AI Medical Scribe capabilities, mobile-to-desktop syncing, and HIPAA-grade security at a price point designed for individual clinicians and small practices.',
  },
  {
    question: 'Does it recognize prescription names and other medical terms?',
    answer:
      'Yes, VoiceboxMD has tailored vocabulary to help doctors and practitioners use many prescription names and medical terms. New words are constantly added to the vocabulary in updates. VoiceboxMD also gives you the flexibility of expanding its core vocabulary.',
  },
  {
    question: 'Are all updates free of cost? Can I cancel any time?',
    answer:
      'Yes, all future updates are free of cost. Yes, you may cancel at any time with no additional charge.',
  },
  {
    question: 'Can I change plans and add seats later?',
    answer:
      'Yes, at any time, you may change plans and modify seats. The total cost will be prorated based on number of licenses and plan you commit to.',
  },
  {
    question: 'Can I use it to dictate emails and word documents?',
    answer:
      'VoiceboxMD is compatible on most Mac and Windows Apps including MS Word, Outlook, Excel. You can also use VoiceboxMD as a regular dictation software to dictate emails.',
  },
  {
    question: 'What microphones are supported?',
    answer:
      'VoiceboxMD is compatible with most microphones that produce 16-bit to 24-bit samples. The internal laptop microphone works just as well. For better accuracy and dictation in noisy environments, we recommend either a Samson Go Mic or Philips Speech Mike.',
  },
];

const PLAN_FAQS: FAQItem[] = [
  {
    question: 'What is the main difference between Essential, Standard and Pro?',
    answer:
      'The main difference is workflow and mobile capability. Essential Plan: An Active Dictation tool for a single device — you press a button to speak, and the software types in real-time. Standard Plan: Adds advanced flexibility with multi-device support, audio file uploads, and full access to the VB Virtual Scribe mobile app for on-the-go dictation. Pro Plan: A Hybrid AI Scribe that includes all Standard features plus Ambient Listening — it listens to your patient encounters and automatically generates the SOAP note for you.',
  },
  {
    question: 'Why would I choose the Standard Plan over Essential?',
    answer:
      'Choose the Standard Plan if you need a professional, multi-platform workflow. It adds three critical features: 1) VB Virtual Scribe Mobile App for recording encounters anywhere and syncing AI-summarized notes to your desktop. 2) Audio Uploads — record a patient visit on any voice recorder or phone app while offline, then upload the file later for instant transcription. 3) Multi-Device Support — stay logged in on up to 3 devices simultaneously.',
  },
  {
    question: 'Does the Pro Plan write SOAP notes automatically?',
    answer:
      'Yes. The Pro Plan features Doctor-Patient Interaction Comprehension. You place your device on the desk, have a natural conversation with the patient, and the AI filters out the small talk to generate a structured clinical summary, SOAP note, and even a Superbill suggestion automatically.',
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Absolutely. There are no contracts. You can start on the Essential plan to test the dictation accuracy and upgrade to Pro later to unlock the Ambient AI Scribe features. You can upgrade or downgrade at any time from your dashboard.',
  },
  {
    question: 'Is there a setup fee or long-term contract?',
    answer:
      'No. All plans are month-to-month with zero setup fees. We believe you should stay because the software works, not because you are locked in. Every plan includes a free trial so you can experience the time savings risk-free.',
  },
];

function AccordionSection({ title, items }: { title: string; items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <h3 className="mb-4 text-lg font-bold text-gray-900">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <svg
                  className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="border-t border-gray-100 px-5 py-4">
                  <p className="text-sm leading-relaxed text-gray-600">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section className="bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            If you cannot find the answer below, please use the{' '}
            <a
              href="https://voiceboxmd.com/support/"
              className="font-medium text-primary underline"
            >
              contact form
            </a>{' '}
            or send us an email.
          </p>
        </div>

        <div className="space-y-10">
          <AccordionSection title="General" items={GENERAL_FAQS} />
          <AccordionSection title="Plans & Pricing" items={PLAN_FAQS} />
        </div>
      </div>
    </section>
  );
}
