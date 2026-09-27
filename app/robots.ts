import type { MetadataRoute } from 'next';
import { SITE_URL } from './lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /my-prep and /dl-admin also carry their own robots: noindex; disallowing here as well
      // keeps crawlers from even requesting them. /study/ is the guides' own static content
      // (loaded in an iframe) — the canonical page is the guide route, not this fragment.
      disallow: ['/my-prep', '/dl', '/dl-admin', '/study/'],
    },
    sitemap: SITE_URL + '/sitemap.xml',
  };
}
