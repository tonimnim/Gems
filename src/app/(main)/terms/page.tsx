'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Scale, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-[#092327]">Terms of Service</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#00AA6C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-[#00AA6C]" />
          </div>
          <h2 className="text-2xl font-bold text-[#092327] mb-2">Terms of Service</h2>
          <p className="text-gray-500">
            Last updated: January 30, 2025
          </p>
        </div>

        {/* Intro */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <p className="text-gray-600 leading-relaxed">
            Welcome to Gems! By using our platform, you agree to these terms. Please read them
            carefully before using our services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Using Gems */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#092327]">Using Gems</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span>You must be at least 18 years old to create an account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span>Provide accurate information when registering</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span>Keep your account credentials secure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span>Use the platform respectfully and lawfully</span>
              </li>
            </ul>
          </section>

          {/* For Gem Owners */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#092327]">For Gem Owners</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span>You must have the right to list the business or location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span>All listing information must be accurate and up-to-date</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span>Photos must be original or you must have rights to use them</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span>Listings are subject to review and approval</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span>We may remove listings that violate these terms</span>
              </li>
            </ul>
          </section>

          {/* Prohibited Content */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-[#092327]">Prohibited Content</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                <span>False, misleading, or fraudulent information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                <span>Illegal activities or services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                <span>Harmful, abusive, or offensive content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                <span>Content that infringes intellectual property rights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                <span>Spam or unauthorized advertising</span>
              </li>
            </ul>
          </section>

          {/* Liability */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Scale className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#092327]">Limitation of Liability</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Gems provides a platform for discovering places. We do not guarantee the accuracy
              of listings or the quality of services provided by listed businesses. Your
              interactions with businesses are solely between you and the business owner.
              We are not liable for any damages arising from your use of our platform.
            </p>
          </section>

          {/* Account Termination */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#092327] mb-3">Account Termination</h3>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms.
              You may also delete your account at any time through your profile settings.
            </p>
          </section>

          {/* Changes */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#092327] mb-3">Changes to Terms</h3>
            <p className="text-gray-600 leading-relaxed">
              We may update these terms from time to time. Continued use of Gems after changes
              constitutes acceptance of the new terms. We will notify you of significant changes.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#092327] mb-3">Questions?</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <a
              href="https://wa.me/254705708643"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#00AA6C] font-medium hover:underline"
            >
              Chat with us on WhatsApp
            </a>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center">
          <Link href="/privacy" className="text-[#00AA6C] hover:underline text-sm">
            Privacy Policy
          </Link>
          <span className="text-gray-300 mx-3">|</span>
          <span className="text-sm text-gray-400">Gems - Discover Amazing Places Across Africa</span>
        </div>
      </main>
    </div>
  );
}
