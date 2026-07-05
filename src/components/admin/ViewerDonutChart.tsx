import { useMemo, useState } from "react";
import type { ViewerSlice } from "../../services/adminAnalytics";

type ViewerDonutChartProps = {
  slices: ViewerSlice[];
};

const colors = ["#0a0a0a", "#737373", "#a3a3a3", "#d4d4d4", "#38bdf8"];

function getArc(value: number, total: number, offset: number) {
  return {
    dashArray: `${value} ${Math.max(total - value, 0)}`,
    dashOffset: -offset,
  };
}

export function ViewerDonutChart({ slices }: ViewerDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const arcs = useMemo(() => {
    let offset = 0;
    return slices.map((slice, index) => {
      const arc = getArc(slice.value, Math.max(total, 1), offset);
      offset += slice.value;
      return { ...slice, ...arc, color: colors[index % colors.length] };
    });
  }, [slices, total]);
  const activeSlice = arcs[activeIndex] || arcs[0];

  if (total === 0) {
    return <div className="admin-empty-chart">No viewer data yet.</div>;
  }

  return (
    <div className="viewer-donut">
      <div className="viewer-donut-visual">
        <svg viewBox="0 0 120 120" role="img" aria-label="Viewer donut chart">
          <circle className="donut-track" cx="60" cy="60" r="42" pathLength={total} />
          {arcs.map((slice, index) => (
            <circle
              className="donut-slice"
              cx="60"
              cy="60"
              r="42"
              pathLength={total}
              stroke={slice.color}
              strokeDasharray={slice.dashArray}
              strokeDashoffset={slice.dashOffset}
              key={slice.label}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              tabIndex={0}
            />
          ))}
        </svg>
        <div>
          <strong>{activeSlice?.value || 0}</strong>
          <span>{activeSlice?.label || "Viewers"}</span>
        </div>
      </div>
      <div className="viewer-donut-list">
        {arcs.slice(0, 5).map((slice, index) => (
          <button className={index === activeIndex ? "is-active" : ""} type="button" key={slice.label} onClick={() => setActiveIndex(index)}>
            <i style={{ background: slice.color }} />
            <span>{slice.label}</span>
            <strong>{Math.round((slice.value / total) * 100)}%</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
