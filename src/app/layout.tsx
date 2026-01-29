import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/context/auth-context';
import { NotificationProvider } from '@/context/notification-context';
import { LocationProvider } from '@/context/location-context';
import { APP_NAME, APP_DESCRIPTION } from '@/constants';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - Discover Amazing Places Across Africa`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    'hidden gems',
    'Africa travel',
    'restaurants',
    'nature',
    'adventure',
    'Kenya',
    'Nigeria',
    'South Africa',
    'tourism',
    'discover',
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: APP_NAME,
    title: `${APP_NAME} - Discover Amazing Places Across Africa`,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} - Discover Amazing Places Across Africa`,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#00AA6C',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/favicon.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <LocationProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
