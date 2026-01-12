import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Us - Our Date Planner',
    short_name: 'Us',
    description: 'A private, shared app for couples to plan intentional dates and celebrate memories together.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFBEB',
    theme_color: '#F43F5E',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    categories: ['lifestyle', 'social'],
  };
}
