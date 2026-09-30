import { useId } from "react";
import { SYMBOL_PARTS, SYMBOL_SIZE } from "../../symbol.ts";
import type { Paint, SymbolPart } from "../../types.ts";
import type { OctusIconProps } from "./types.ts";

const ICON_SIZE = 1000;
// Same share of the tile the symbol takes in the current launcher icon.
const SYMBOL_SCALE = 0.72;
const SYMBOL_OFFSET = (ICON_SIZE * (1 - SYMBOL_SCALE)) / 2;

const MASKS = {
  squircle: { rx: ICON_SIZE * 0.22 },
  circle: { rx: ICON_SIZE / 2 },
};

export function OctusIcon({
  colors,
  mask = "squircle",
  className,
}: OctusIconProps) {
  const id = useId();
  const paints: [string, Paint][] = [
    ["background", colors.background],
    ...Object.entries(colors.parts),
  ];
  const fill = (key: string, paint: Paint) =>
    typeof paint === "string" ? paint : `url(#${id}-${key})`;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${ICON_SIZE} ${ICON_SIZE}`}
      role="img"
      aria-label="Октус"
    >
      <defs>
        {paints.map(
          ([key, paint]) =>
            typeof paint !== "string" && (
              <linearGradient
                key={key}
                id={`${id}-${key}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0" stopColor={paint[0]} />
                <stop offset="1" stopColor={paint[1]} />
              </linearGradient>
            ),
        )}
      </defs>
      <rect
        width={ICON_SIZE}
        height={ICON_SIZE}
        rx={MASKS[mask].rx}
        fill={fill("background", colors.background)}
      />
      <g
        transform={`translate(${SYMBOL_OFFSET} ${SYMBOL_OFFSET}) scale(${(ICON_SIZE * SYMBOL_SCALE) / SYMBOL_SIZE})`}
      >
        {(Object.keys(SYMBOL_PARTS) as SymbolPart[]).map((part) => (
          <path
            key={part}
            d={SYMBOL_PARTS[part]}
            fill={fill(part, colors.parts[part])}
          />
        ))}
      </g>
    </svg>
  );
}
