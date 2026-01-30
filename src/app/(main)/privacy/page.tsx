'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 z-10 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-black mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: January 30, 2025</p>

        <div className="space-y-10 text-gray-800">
          <p>
            Gems ("we", "our", or "us") is committed to protecting your privacy. This policy explains
            how we collect, use, and safeguard your information when you use our platform.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-black mb-4">What We Collect</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Account Information</strong> — Name, email, and profile details when you register</li>
              <li><strong>Listing Data</strong> — Business information, photos, and location when you add a gem</li>
              <li><strong>Usage Data</strong> — How you interact with our platform to improve your experience</li>
              <li><strong>Device Information</strong> — Browser type, IP address, and device identifiers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-4">How We Use Your Information</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Provide and personalize our services</li>
              <li>Display your listings to travelers</li>
              <li>Send important updates and notifications</li>
              <li>Improve our platform and develop new features</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-4">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data including
              encrypted data transmission and secure servers. We never sell your personal
              information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-4">Your Rights</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Access</strong> — Request a copy of your personal data</li>
              <li><strong>Correction</strong> — Update or correct inaccurate information</li>
              <li><strong>Deletion</strong> — Request deletion of your account and data</li>
              <li><strong>Opt-out</strong> — Unsubscribe from marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-4">Cookies</h2>
            <p>
              We use essential cookies to make our platform work. We may also use analytics cookies
              to understand how you use Gems. You can manage cookie preferences in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              significant changes by posting a notice on our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-4">Contact Us</h2>
            <p className="mb-2">
              If you have questions about this Privacy Policy or wish to exercise your rights:
            </p>
            <a
              href="https://wa.me/254705708643"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Chat with us on WhatsApp
            </a>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 text-sm text-gray-400">
          <Link href="/terms" className="underline mr-6">Terms of Service</Link>
          <span>Gems</span>
        </div>
      </main>
    </div>
  );
}
