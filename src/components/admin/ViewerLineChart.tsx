import { useEffect, useMemo, useRef, useState } from "react";
import type { ViewerPoint } from "../../services/adminAnalytics";
import { DataState } from "../ui/DataState";

type ViewerLineChartProps = {
  data: ViewerPoint[];
  totalViewers: number;
};

type ChartPoint = {
  x: number;
  newY: number;
  cumulativeY: number;
  label: string;
  viewers: number;
  cumulative: number;
};

const width = 760;
const height = 320;
const padding = { top: 30, right: 20, bottom: 54, left: 48 };

function getSmoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const controlX = previous.x + (point.x - previous.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function getAreaPath(points: { x: number; y: number }[], baseline: number) {
  if (points.length === 0) return "";
  const first = points[0];
  const last = points[points.length - 1];
  return `${getSmoothPath(points)} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

function getNiceMaximum(value: number) {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

export function ViewerLineChart({ data, totalViewers }: ViewerLineChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const graphScrollRef = useRef<HTMLDivElement>(null);
  const chart = useMemo(() => {
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const totalNew = data.reduce((total, point) => total + point.viewers, 0);
    const startingTotal = Math.max(totalViewers - totalNew, 0);
    const cumulativeValues = data.reduce<number[]>((values, point, index) => {
      values.push((values[index - 1] ?? startingTotal) + point.viewers);
      return values;
    }, []);
    const rawMaximum = Math.max(0, ...data.map((point) => point.viewers), ...cumulativeValues);
    const maxValue = getNiceMaximum(rawMaximum);
    const xStep = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth;
    const toY = (value: number) => padding.top + innerHeight - (value / maxValue) * innerHeight;
    const points: ChartPoint[] = data.map((point, index) => ({
      x: padding.left + index * xStep,
      newY: toY(point.viewers),
      cumulativeY: toY(cumulativeValues[index] || 0),
      label: point.label,
      viewers: point.viewers,
      cumulative: cumulativeValues[index] || 0,
    }));
    const peak = data.reduce<ViewerPoint | null>((current, point) => {
      if (!current || point.viewers > current.viewers) return point;
      return current;
    }, null);

    return { points, maxValue, totalNew, cumulativeTotal: cumulativeValues.at(-1) || 0, peak };
  }, [data, totalViewers]);

  useEffect(() => {
    const graphScroll = graphScrollRef.current;

    if (!graphScroll || data.length === 0) {
      return;
    }

    window.requestAnimationFrame(() => {
      graphScroll.scrollLeft = graphScroll.scrollWidth;
    });
  }, [data.length]);

  if (data.length === 0) {
    return <DataState type="empty" label="No viewer data yet" description="Viewer activity will appear here once visits are recorded." />;
  }

  const baseline = height - padding.bottom;
  const active = activeIndex === null ? null : chart.points[activeIndex];
  const tickValues = Array.from({ length: 5 }, (_, index) => Math.round((chart.maxValue * index) / 4));

  return (
    <div className="viewer-line-chart">
      <div className="chart-summary" aria-label="Viewer period summary">
        <span><small>New users</small><strong>{chart.totalNew.toLocaleString()}</strong></span>
        <span><small>Cumulative</small><strong>{chart.cumulativeTotal.toLocaleString()}</strong></span>
        <span><small>Peak day</small><strong>{chart.peak?.label || "-"}</strong></span>
      </div>

      <div className="viewer-graph-scroll" ref={graphScrollRef}>
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily new and returning viewer line graph">
        <defs>
          <linearGradient id="viewerCumulativeFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect className="chart-soft-bg" x={padding.left} y={padding.top} width={width - padding.left - padding.right} height={baseline - padding.top} rx="10" />

        {tickValues.map((value) => {
          const y = baseline - (value / chart.maxValue) * (baseline - padding.top);
          return (
            <g key={value}>
              <line className="chart-grid-line" x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
              <text className="chart-y-label" x={padding.left - 12} y={y + 4}>{value}</text>
            </g>
          );
        })}

        <path className="chart-area chart-area-upper" d={getAreaPath(chart.points.map((point) => ({ x: point.x, y: point.cumulativeY })), baseline)} />
        <path className="chart-line chart-line-viewers" d={getSmoothPath(chart.points.map((point) => ({ x: point.x, y: point.newY })))} />
        <path className="chart-line chart-line-cumulative" d={getSmoothPath(chart.points.map((point) => ({ x: point.x, y: point.cumulativeY })))} />

        {active ? <line className="chart-active-line" x1={active.x} x2={active.x} y1={padding.top} y2={baseline} /> : null}

        {chart.points.map((point, index) => (
          <g
            className="chart-hit"
            role="button"
            tabIndex={0}
            aria-label={`${point.label}: ${point.viewers} new and ${point.cumulative} cumulative users`}
            key={`${point.label}-${index}`}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => setActiveIndex(null)}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={() => setActiveIndex(index)}
          >
            <rect x={point.x - Math.max((width - padding.left - padding.right) / data.length / 2, 12)} y={padding.top} width={Math.max((width - padding.left - padding.right) / data.length, 24)} height={baseline - padding.top} fill="transparent" />
            <circle className="chart-marker-upper" cx={point.x} cy={point.newY} r={index === activeIndex ? 5.5 : 3.5} />
            <circle className="chart-marker-cumulative" cx={point.x} cy={point.cumulativeY} r={index === activeIndex ? 5 : 3} />
          </g>
        ))}

        {chart.points.map((point, index) => {
          const showLabel = index === 0 || index === chart.points.length - 1 || index % 2 === 0;
          return showLabel ? <text className="chart-x-label" x={point.x} y={height - 22} key={`label-${point.label}-${index}`}>{point.label}</text> : null;
        })}

        {active ? (
          <g className="chart-tooltip" transform={`translate(${Math.min(Math.max(active.x - 88, padding.left + 4), width - 196)} ${padding.top + 10})`}>
            <rect width="176" height="86" rx="8" />
            <text className="chart-tooltip-title" x="14" y="23">{active.label}</text>
            <text x="14" y="46">New users</text>
            <text className="chart-tooltip-value" x="150" y="46">{active.viewers}</text>
            <text x="14" y="68">Cumulative</text>
            <text className="chart-tooltip-value" x="150" y="68">{active.cumulative}</text>
          </g>
        ) : null}
        </svg>
      </div>

      <div className="chart-legend">
        <span><i className="is-viewers" />New users</span>
        <span><i className="is-cumulative" />Cumulative users</span>
      </div>
    </div>
  );
}
