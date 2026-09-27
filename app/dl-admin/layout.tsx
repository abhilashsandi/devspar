// Admin panel for the DPS scheduler tool. Not for search engines.
export const metadata = {
  title: 'DPS Scheduler Admin',
  robots: { index: false, follow: false, nocache: true },
};

export default function DlAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
