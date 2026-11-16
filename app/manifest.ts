import type { MetadataRoute } from 'next';

// The web app manifest: lets a phone or desktop install DevSpar like an app. Colours are the site's light-theme
// page background (--board in app/globals.css). Icons come from scripts/make-icons.mjs.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DevSpar',
    short_name: 'DevSpar',
    description: 'Full-stack interview prep you can explain on a whiteboard: study guides, diagrams, flashcards and an AI mock interviewer.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F7FA',
    theme_color: '#F5F7FA',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
