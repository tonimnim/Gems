import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gems',
    short_name: 'Gems',
    description: 'Discover amazing hidden gems across Africa - restaurants, nature spots, cultural sites, and more',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#00AA6C',
    orientation: 'portrait-primary',
    categories: ['travel', 'lifestyle', 'food'],
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
