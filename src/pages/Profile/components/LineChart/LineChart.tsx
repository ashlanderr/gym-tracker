import s from "./styles.module.scss";
import { clsx } from "clsx";
import type { LineChartProps } from "./types.ts";

// The line is drawn in a unit square stretched over whatever box the parent
// gives it, so one chart serves the card and the whole page. The dot on the
// last value is a box of its own: a circle stretched with the line would
// turn into an oval.
export function LineChart({ points, className }: LineChartProps) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
  const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];
  const scale = (value: number, min: number, max: number) =>
    max === min ? 0.5 : (value - min) / (max - min);

  const coords = points.map((p) => ({
    x: scale(p.x, minX, maxX),
    y: 1 - scale(p.y, minY, maxY),
  }));
  const path = coords
    .map(({ x, y }, i) => `${i === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");
  const last = coords.at(-1);

  return (
    <div className={clsx(s.root, className)}>
      <div className={s.plot}>
        <svg className={s.svg} viewBox="0 0 1 1" preserveAspectRatio="none">
          <path className={s.line} d={path} vectorEffect="non-scaling-stroke" />
        </svg>
        {last && (
          <i
            className={s.dot}
            style={{ left: `${last.x * 100}%`, top: `${last.y * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}
