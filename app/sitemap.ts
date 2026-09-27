import type { MetadataRoute } from 'next';
import { SITE_URL } from './lib/siteUrl';

// /my-prep, /dl and /dl-admin are all robots: noindex and intentionally left out here too.
// /study/*.html (the guides' own static files, loaded in an iframe) are deliberately excluded:
// the canonical page for that content is the guide route below, not the fragment it embeds —
// see robots.ts, which disallows /study/ for the same reason.
const GUIDES = [
  ['interview-prep', 0.9], ['interview-cheatsheet', 0.7], ['genai', 0.8],
  ['javascript', 0.8], ['react-training', 0.8], ['reactjs', 0.8], ['nextjs', 0.8],
  ['nodejs', 0.8], ['tailwind-css', 0.8], ['coding-questions', 0.8],
  ['system-design', 0.8], ['system-design-scale', 0.7], ['performance-optimization', 0.7],
  ['web-platform', 0.8],
] as const;
const LABS = ['coding-questions/labs', 'javascript/labs', 'react-training/labs', 'system-design/labs'];
const TOOLS = ['csv-tools', 'pdf-tools'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL + '/', lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...GUIDES.map(([slug, priority]) => ({ url: `${SITE_URL}/${slug}`, lastModified: now, changeFrequency: 'weekly' as const, priority })),
    ...LABS.map((slug) => ({ url: `${SITE_URL}/${slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...TOOLS.map((slug) => ({ url: `${SITE_URL}/${slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 })),
  ];
}
