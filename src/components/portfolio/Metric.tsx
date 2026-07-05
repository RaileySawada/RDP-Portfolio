type MetricProps = {
  label: string;
  value: string;
  isLoading?: boolean;
};

export function Metric({ label, value, isLoading = false }: MetricProps) {
  return (
    <div className="metric-card rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
      <p className="metadata text-neutral-500 dark:text-neutral-500">{label}</p>
      {isLoading ? (
        <span className="mt-2 block h-7 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" aria-hidden="true" />
      ) : (
        <p className="mt-2 font-display text-2xl font-semibold text-neutral-950 dark:text-white">{value}</p>
      )}
    </div>
  );
}
