import Link from 'next/link';
import { Gem, Instagram, Facebook } from 'lucide-react';
import { ROUTES } from '@/constants';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'TikTok', icon: TikTokIcon, href: '#' },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href={ROUTES.home} className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#092327]">
                <Gem className="h-4 w-4 text-[#34E0A1]" />
              </div>
              <span className="text-lg font-bold text-[#00AA6C]">Gems</span>
            </Link>
            <p className="text-sm text-gray-600 text-center md:text-left max-w-xs">
              Discover extraordinary places across Africa that most travelers never find.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex gap-3">
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

        {/* Bottom */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {currentYear} Gems. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/team" className="hover:text-gray-700 transition-colors">Team</Link>
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
