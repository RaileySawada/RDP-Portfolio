import { useMemo, useState } from "react";
import type { ViewerPoint } from "../../services/adminAnalytics";

type ViewerLineChartProps = {
  data: ViewerPoint[];
};

const width = 760;
const height = 300;
const padding = { top: 34, right: 18, bottom: 66, left: 18 };

function getPath(points: { x: number; y: number }[]) {
  if (points.length === 0) {
    return "";
  }

  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function getSmoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) {
    return getPath(points);
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const controlX = previous.x + (point.x - previous.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function getSteppedPath(points: { x: number; y: number }[]) {
  if (points.length < 2) {
    return getPath(points);
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const midX = previous.x + (point.x - previous.x) * 0.55;
    return `${path} C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function getAreaPath(points: { x: number; y: number }[], baseline: number) {
  if (points.length === 0) {
    return "";
  }

  const line = getSteppedPath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${line} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

function createBuckets(data: ViewerPoint[], bucketCount = 6) {
  if (data.length === 0) {
    return [];
  }

  return Array.from({ length: Math.min(bucketCount, data.length) }, (_, index) => {
    const start = Math.floor((index * data.length) / Math.min(bucketCount, data.length));
    const end = Math.floor(((index + 1) * data.length) / Math.min(bucketCount, data.length));
    const items = data.slice(start, Math.max(end, start + 1));
    const first = items[0];
    const last = items[items.length - 1];
    const viewers = items.reduce((total, item) => total + item.viewers, 0);
    const returning = items.reduce((total, item) => total + item.returning, 0);

    return {
      label: first.label === last.label ? first.label : `${first.label}-${last.label}`,
      viewers,
      returning,
      total: viewers + returning,
    };
  });
}

export function ViewerLineChart({ data }: ViewerLineChartProps) {
  const buckets = useMemo(() => createBuckets(data), [data]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chart = useMemo(() => {
    const cumulativeTotals = buckets.reduce<number[]>((totals, bucket, index) => {
      totals.push((totals[index - 1] || 0) + bucket.total);
      return totals;
    }, []);
    const maxValue = Math.max(1, ...cumulativeTotals, ...buckets.map((bucket) => bucket.viewers));
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const xStep = buckets.length > 1 ? innerWidth / (buckets.length - 1) : innerWidth;
    const toY = (value: number) => padding.top + innerHeight - (value / maxValue) * innerHeight;

    return {
      maxValue,
      upper: buckets.map((bucket, index) => ({
        x: padding.left + index * xStep,
        y: toY(cumulativeTotals[index] || 0),
        value: cumulativeTotals[index] || 0,
        label: bucket.label,
      })),
      lower: buckets.map((bucket, index) => ({
        x: padding.left + index * xStep,
        y: toY(bucket.viewers),
        value: bucket.viewers,
        label: bucket.label,
        returning: bucket.returning,
      })),
    };
  }, [buckets]);

  const activeUpper = activeIndex === null ? null : chart.upper[activeIndex];
  const activeLower = activeIndex === null ? null : chart.lower[activeIndex];
  const baseline = height - padding.bottom;

  if (buckets.length === 0) {
    return <div className="admin-empty-chart">No viewer data yet.</div>;
  }

  return (
    <div className="viewer-line-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Viewer line graph">
        <defs>
          <linearGradient id="viewerUpperFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="viewerLowerFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect className="chart-soft-bg" x="0" y="0" width={width} height={height} rx="14" />
        {Array.from({ length: 4 }, (_, index) => {
          const y = padding.top + ((baseline - padding.top) / 3) * index;
          return <line className="chart-grid-line" x1={padding.left} x2={width - padding.right} y1={y} y2={y} key={index} />;
        })}
        {chart.upper.map((point) => (
          <line className="chart-v-line" x1={point.x} x2={point.x} y1={padding.top - 14} y2={baseline + 10} key={point.label} />
        ))}
        <path className="chart-area chart-area-upper" d={getAreaPath(chart.upper, baseline)} />
        <path className="chart-area chart-area-lower" d={getAreaPath(chart.lower, baseline)} />
        <path className="chart-line chart-line-viewers" d={getSteppedPath(chart.upper)} />
        <path className="chart-line chart-line-returning" d={getSmoothPath(chart.lower)} />
        {chart.upper.map((point, index) => (
          <g
            className="chart-hit"
            role="button"
            tabIndex={0}
            aria-label={`${point.label}: ${point.value} cumulative viewers`}
            key={point.label}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => setActiveIndex(null)}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={() => setActiveIndex(index)}
          >
            <rect x={point.x - 34} y={padding.top - 22} width="68" height={baseline - padding.top + 82} fill="transparent" />
            <circle className="chart-marker-upper" cx={point.x} cy={point.y} r={index === activeIndex ? 6 : 4} />
            <circle className="chart-marker-lower" cx={chart.lower[index].x} cy={chart.lower[index].y} r={index === activeIndex ? 4.5 : 3.5} />
          </g>
        ))}
        {chart.lower.map((point) => (
          <g className="chart-x-label" transform={`translate(${point.x} ${height - 24})`} key={`label-${point.label}`}>
            <text y="-15">{point.value}</text>
            <text>{point.label}</text>
          </g>
        ))}
        {activeUpper && activeLower ? (
          <g className="chart-tooltip" transform={`translate(${Math.min(Math.max(activeUpper.x - 95, 12), width - 202)} ${Math.max(activeUpper.y - 96, 8)})`}>
            <rect width="190" height="76" rx="10" />
            <text className="chart-tooltip-title" x="14" y="24">{activeUpper.label}</text>
            <text x="14" y="48">Total viewers</text>
            <text className="chart-tooltip-value" x="146" y="48">{activeUpper.value}</text>
            <text x="14" y="64">New viewers</text>
            <text className="chart-tooltip-value" x="146" y="64">{activeLower.value}</text>
          </g>
        ) : null}
      </svg>
      <div className="chart-legend">
        <span><i className="is-viewers" />Total viewers</span>
        <span><i className="is-returning" />New viewers</span>
      </div>
    </div>
  );
}
