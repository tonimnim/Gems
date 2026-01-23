import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hidden Gems Africa',
    short_name: 'Hidden Gems',
    description: 'Discover amazing hidden gems across Africa - restaurants, nature spots, cultural sites, and more',
    start_url: '/',
    display: 'standalone',
    background_color: '#FEFAE0',
    theme_color: '#E85D04',
    orientation: 'portrait-primary',
    categories: ['travel', 'lifestyle', 'food'],
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/images/screenshot-mobile.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: '/images/screenshot-desktop.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
  };
}
