type MetricProps = {
  label: string;
  value: string;
};

export function Metric({ label, value }: MetricProps) {
  return (
    <div className="metric-card rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
      <p className="metadata text-neutral-500 dark:text-neutral-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-neutral-950 dark:text-white">{value}</p>
    </div>
  );
}
