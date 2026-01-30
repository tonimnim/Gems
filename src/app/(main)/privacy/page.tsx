'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Users, Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
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
          <h1 className="text-lg font-semibold text-[#092327]">Privacy Policy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#00AA6C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-[#00AA6C]" />
          </div>
          <h2 className="text-2xl font-bold text-[#092327] mb-2">Your Privacy Matters</h2>
          <p className="text-gray-500">
            Last updated: January 30, 2025
          </p>
        </div>

        {/* Intro */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <p className="text-gray-600 leading-relaxed">
            Gems ("we", "our", or "us") is committed to protecting your privacy. This policy explains
            how we collect, use, and safeguard your information when you use our platform to discover
            and list hidden gems across Africa.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* What We Collect */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#092327]">What We Collect</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span><strong>Account Information:</strong> Name, email, and profile details when you register</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span><strong>Listing Data:</strong> Business information, photos, and location when you add a gem</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span><strong>Usage Data:</strong> How you interact with our platform to improve your experience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span><strong>Device Information:</strong> Browser type, IP address, and device identifiers</span>
              </li>
            </ul>
          </section>

          {/* How We Use It */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#092327]">How We Use Your Information</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span>Provide and personalize our services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span>Display your listings to travelers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span>Send important updates and notifications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span>Improve our platform and develop new features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span>Ensure security and prevent fraud</span>
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Lock className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#092327]">Data Security</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We implement industry-standard security measures to protect your data. This includes
              encrypted data transmission, secure servers, and regular security audits. We never
              sell your personal information to third parties.
            </p>
          </section>

          {/* Your Rights */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-[#092327]">Your Rights</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span><strong>Access:</strong> Request a copy of your personal data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span><strong>Correction:</strong> Update or correct inaccurate information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span><strong>Deletion:</strong> Request deletion of your account and data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-[#00AA6C] rounded-full mt-2 flex-shrink-0" />
                <span><strong>Opt-out:</strong> Unsubscribe from marketing communications</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-[#092327]">Contact Us</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or wish to exercise your rights,
              please contact us:
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

          {/* Cookies */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#092327] mb-3">Cookies</h3>
            <p className="text-gray-600 leading-relaxed">
              We use essential cookies to make our platform work. We may also use analytics cookies
              to understand how you use Gems and improve our services. You can manage cookie
              preferences in your browser settings.
            </p>
          </section>

          {/* Changes */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#092327] mb-3">Changes to This Policy</h3>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any
              significant changes by posting a notice on our platform or sending you an email.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-400">
          <p>Gems - Discover Amazing Places Across Africa</p>
        </div>
      </main>
    </div>
  );
}
