"use client";

import { useRef, useState } from "react";
import type { SeriesPoint } from "@/lib/analytics";

const WIDTH = 600;
const HEIGHT = 200;
const PAD_LEFT = 8;
const PAD_RIGHT = 8;
const PAD_TOP = 14;
const PAD_BOTTOM = 24;

export function SeriesChart({
  points,
  color,
  mode = "line",
  formatValue = (n) => String(n),
  labelEvery = 1,
}: {
  points: SeriesPoint[];
  color: string;
  mode?: "line" | "bar";
  formatValue?: (value: number) => string;
  labelEvery?: number;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const innerW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const maxValue = Math.max(...points.map((p) => p.value), 1);
  const step = points.length > 1 ? innerW / (points.length - 1) : 0;
  const barWidth = points.length > 0 ? Math.min((innerW / points.length) * 0.6, 36) : 0;

  function xFor(i: number) {
    if (mode === "bar") {
      const slot = innerW / points.length;
      return PAD_LEFT + slot * i + slot / 2;
    }
    return PAD_LEFT + step * i;
  }
  function yFor(value: number) {
    return PAD_TOP + innerH - (value / maxValue) * innerH;
  }

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || points.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((_, i) => {
      const dist = Math.abs(xFor(i) - relX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  const gridLines = [0, 0.5, 1];
  const linePath =
    mode === "line"
      ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.value)}`).join(" ")
      : "";
  const areaPath =
    mode === "line" && points.length > 0
      ? `${linePath} L ${xFor(points.length - 1)} ${PAD_TOP + innerH} L ${xFor(0)} ${PAD_TOP + innerH} Z`
      : "";

  const hovered = hoverIndex != null ? points[hoverIndex] : null;
  const tooltipLeftPct = hoverIndex != null ? (xFor(hoverIndex) / WIDTH) * 100 : 0;
  const tooltipTopPct = hovered ? (yFor(hovered.value) / HEIGHT) * 100 : 0;

  return (
    <div className="chart-svg-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {gridLines.map((g) => (
          <line
            key={g}
            className="chart-grid-line"
            x1={PAD_LEFT}
            x2={WIDTH - PAD_RIGHT}
            y1={PAD_TOP + innerH * (1 - g)}
            y2={PAD_TOP + innerH * (1 - g)}
          />
        ))}

        {mode === "line" && points.length > 0 && (
          <>
            <path d={areaPath} fill={color} opacity={0.12} stroke="none" />
            <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {points.map((p, i) => (
              <circle
                key={p.label}
                cx={xFor(i)}
                cy={yFor(p.value)}
                r={i === points.length - 1 ? 4 : hoverIndex === i ? 4 : 0}
                fill={color}
                stroke="var(--surface)"
                strokeWidth={i === points.length - 1 || hoverIndex === i ? 2 : 0}
              />
            ))}
          </>
        )}

        {mode === "bar" &&
          points.map((p, i) => {
            const h = (p.value / maxValue) * innerH;
            return (
              <rect
                key={p.label}
                x={xFor(i) - barWidth / 2}
                y={PAD_TOP + innerH - h}
                width={barWidth}
                height={Math.max(h, p.value > 0 ? 2 : 0)}
                rx={4}
                fill={color}
                opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.45}
              />
            );
          })}

        {hoverIndex != null && mode === "line" && (
          <line
            className="chart-crosshair"
            x1={xFor(hoverIndex)}
            x2={xFor(hoverIndex)}
            y1={PAD_TOP}
            y2={PAD_TOP + innerH}
          />
        )}

        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text
              key={p.label}
              className="chart-axis-label"
              x={xFor(i)}
              y={HEIGHT - 6}
              textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
            >
              {p.label}
            </text>
          ) : null,
        )}
      </svg>

      {hovered && (
        <div className="chart-tooltip" style={{ left: `${tooltipLeftPct}%`, top: `${tooltipTopPct}%` }}>
          {hovered.label} · <span className="chart-tooltip-value">{formatValue(hovered.value)}</span>
        </div>
      )}
    </div>
  );
}
