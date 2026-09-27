// The site's own public URL, used by sitemap.ts, robots.ts and any future canonical/OG tags.
// Set NEXT_PUBLIC_SITE_URL in the deploy environment (Render: the frontend service's env vars) to
// the real domain, e.g. https://devspar.example.com. Falls back to localhost for `next dev`.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
