export function DashboardRoute() {
  return (
    <section className="section-shell pb-20" aria-label="Dashboard route">
      <div className="rounded-lg border border-dashed border-neutral-300 p-5 dark:border-neutral-800">
        <p className="metadata text-neutral-500">Dashboard route: /dashboard-login</p>
        <p className="mt-2 text-sm leading-7 text-neutral-600 dark:text-neutral-400">
          Admin content should use Firebase client authentication and protected Netlify serverless functions. No Firebase Admin SDK is included in this portfolio build.
        </p>
      </div>
    </section>
  );
}
