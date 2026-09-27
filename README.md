This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Study guides

The interview-prep pages (`/interview-prep`, `/nextjs`, `/genai`, ...) each keep their questions
in `app/<guide>/content.json` and load from a generated static file (`public/study/<guide>.html`)
plus one engine shared by every guide (`public/study/engine.js`: search, flashcards, the phone
menu, progress shared across guides), rendered in an iframe by `app/components/StaticPrepClient.tsx`.

After editing any `content.json` (by hand or with a script — see `scripts/study/README.md` for
the toolkit and worked examples), regenerate the generated files:

```bash
npm run study:build
```

This runs automatically before `npm run build`, so a forgotten regeneration can't ship a stale
site — but the generated `public/study/*.html`, `public/study/engine.js`,
`public/search-index.json` and `app/lib/studyMeta.json` are committed like any other file, so
commit them with the content change.

`npm test` (after `npm run build`) starts a production server and checks that every guide loads,
the shared engine works, and the homepage's links and search work — see `tests/`.

`/my-prep` is an encrypted private page (`scripts/encrypt-private.mjs`); nothing links to it, and
it is deliberately never part of `public/study/` (its content only exists client-side, after the
reader's own password decrypts it).

## SEO

Set `NEXT_PUBLIC_SITE_URL` in the deploy environment (the production domain, e.g.
`https://devspar.example.com`) — `app/sitemap.ts` and `app/robots.ts` use it to build absolute
URLs, and fall back to `http://localhost:3000` when it's unset, which is only correct for local
development.
