'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gem, MapPin, Mail, Phone, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { ROUTES, AFRICAN_COUNTRIES } from '@/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    setEmail('');
  };

  const footerLinks = {
    discover: [
      { name: 'Explore All Gems', href: ROUTES.explore },
      { name: 'Featured Gems', href: `${ROUTES.explore}?tier=featured` },
      { name: 'Eat & Drink', href: `${ROUTES.explore}?category=eat_drink` },
      { name: 'Nature & Outdoors', href: `${ROUTES.explore}?category=nature` },
      { name: 'Adventure', href: `${ROUTES.explore}?category=adventure` },
    ],
    owners: [
      { name: 'List Your Gem', href: ROUTES.register },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Owner Dashboard', href: ROUTES.dashboard },
      { name: 'Success Stories', href: '/stories' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Mission', href: '/mission' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Contact', href: '/contact' },
    ],
  };

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'YouTube', icon: Youtube, href: '#' },
  ];

  const featuredCountries = AFRICAN_COUNTRIES.slice(0, 6);

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Newsletter Section */}
      <div className="bg-[#F7F7F7] border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-12 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Never miss a hidden gem
              </h3>
              <p className="mt-1 text-gray-600">
                Get weekly curated discoveries from across Africa.
              </p>
            </div>
            <div className="flex-shrink-0">
              {isSubscribed ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-[#34E0A1]/10 border border-[#34E0A1]/20 rounded-lg text-[#00AA6C]">
                  <span>You&apos;re subscribed!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="px-4 py-3 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#34E0A1] focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#092327] text-white font-semibold rounded-lg hover:bg-[#11292E] transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href={ROUTES.home} className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#092327]">
                <Gem className="h-4 w-4 text-[#34E0A1]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#00AA6C]">Hidden Gems</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500 -mt-1">Africa</span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-gray-600 max-w-xs">
              Discover extraordinary places across Africa that most travelers never find. From secret restaurants to breathtaking viewpoints.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#34E0A1]/10 hover:text-[#00AA6C] transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-sm font-semibold text-[#00AA6C] uppercase tracking-wide">Discover</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.discover.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-[#00AA6C] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="text-sm font-semibold text-[#00AA6C] uppercase tracking-wide">For Owners</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.owners.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-[#00AA6C] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-[#00AA6C] uppercase tracking-wide">Company</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-[#00AA6C] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Countries */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Explore Gems In
          </h4>
          <div className="flex flex-wrap gap-2">
            {featuredCountries.map((country) => (
              <Link
                key={country.code}
                href={`${ROUTES.explore}?country=${country.code}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-[#00AA6C] transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" />
                {country.name}
              </Link>
            ))}
            <Link
              href={ROUTES.explore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#00AA6C] font-medium hover:underline"
            >
              View all countries →
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <a href="mailto:hello@hiddengems.africa" className="flex items-center gap-2 hover:text-[#00AA6C] transition-colors">
              <Mail className="h-4 w-4" />
              hello@hiddengems.africa
            </a>
            <a href="tel:+254700000000" className="flex items-center gap-2 hover:text-[#00AA6C] transition-colors">
              <Phone className="h-4 w-4" />
              +254 700 000 000
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-[#F7F7F7]">
        <div className="max-w-6xl mx-auto px-4 py-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>&copy; {currentYear} Hidden Gems Africa. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-gray-700 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
