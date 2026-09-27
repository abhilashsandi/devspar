import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'Web Platform & Tooling — Interview Prep',
  description: 'CORS, CSP, cookies, HTTP/2 and HTTP/3, caching, service workers, storage, Docker, CI/CD, feature flags, Git and i18n.',
};

export default function WebPlatformPage() {
  return (
    <StaticPrepClient
      src="/study/web-platform.html"
      title="Web Platform & Tooling — Interview Prep"
      loadingLabel="Loading web platform guide…"
    />
  );
}
