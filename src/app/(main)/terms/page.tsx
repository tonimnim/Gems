'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-black mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: January 30, 2025</p>

        <div className="space-y-10 text-gray-800">
          <p>
            Welcome to Gems. By using our platform, you agree to these terms. Please read them
            carefully before using our services.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-black mb-4">Using Gems</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>You must be at least 18 years old to create an account</li>
              <li>Provide accurate information when registering</li>
              <li>Keep your account credentials secure</li>
              <li>Use the platform respectfully and lawfully</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-4">For Gem Owners</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>You must have the right to list the business or location</li>
              <li>All listing information must be accurate and up-to-date</li>
              <li>Photos must be original or you must have rights to use them</li>
              <li>Listings are subject to review and approval</li>
              <li>We may remove listings that violate these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-4">Prohibited Content</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>False, misleading, or fraudulent information</li>
              <li>Illegal activities or services</li>
              <li>Harmful, abusive, or offensive content</li>
              <li>Content that infringes intellectual property rights</li>
              <li>Spam or unauthorized advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-4">Limitation of Liability</h2>
            <p>
              Gems provides a platform for discovering places. We do not guarantee the accuracy
              of listings or the quality of services provided by listed businesses. Your
              interactions with businesses are solely between you and the business owner.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-4">Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms.
              You may delete your account at any time through your profile settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-4">Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of Gems after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-4">Contact</h2>
            <p className="mb-2">
              If you have questions about these Terms of Service:
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
          <Link href="/privacy" className="underline mr-6">Privacy Policy</Link>
          <span>Gems</span>
        </div>
      </main>
    </div>
  );
}
