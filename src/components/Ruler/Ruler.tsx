import s from "./styles.module.scss";
import { type CSSProperties, useEffect, useMemo, useRef } from "react";
import { clsx } from "clsx";
import { useDragScroll } from "../DragScroll";
import { TICK_SPACING } from "./constants.ts";
import type { RulerProps } from "./types.ts";

// A scale the thumb drags past a fixed mark. The scrolling is the browser's
// own, so inertia and snapping come for free on a phone.
export function Ruler({
  min,
  max,
  step,
  majorEvery,
  value,
  axis = "x",
  format = String,
  onChange,
}: RulerProps) {
  const { ref, isDragging, handlers } = useDragScroll(axis);
  const startRef = useRef(value);

  const ticks = useMemo(
    () =>
      Array.from({ length: Math.round((max - min) / step) + 1 }, (_, i) => i),
    [min, max, step],
  );

  // Only the starting value is placed by us: afterwards the scroller is the
  // source of truth, and writing back what it just reported fights the finger.
  useEffect(() => {
    const scroller = ref.current;
    if (!scroller) return;
    const offset = ((startRef.current - min) / step) * TICK_SPACING;
    if (axis === "x") {
      scroller.scrollLeft = offset;
    } else {
      scroller.scrollTop = offset;
    }
  }, [ref, min, step, axis]);

  const scrollHandler = () => {
    const scroller = ref.current;
    if (!scroller) return;

    const offset = axis === "x" ? scroller.scrollLeft : scroller.scrollTop;
    const index = Math.round(offset / TICK_SPACING);
    const next = Math.min(max, Math.max(min, min + index * step));
    if (next !== value) onChange(next);
  };

  return (
    <div className={clsx(s.root, axis === "y" && s.vertical)}>
      <div
        ref={ref}
        className={clsx(s.scroller, isDragging && s.dragging)}
        onScroll={scrollHandler}
        {...handlers}
      >
        <div
          className={s.track}
          style={{ "--tick": `${TICK_SPACING}px` } as CSSProperties}
        >
          {ticks.map((index) => (
            <i
              key={index}
              className={clsx(s.tick, index % majorEvery === 0 && s.major)}
            >
              {index % majorEvery === 0 && (
                <span className={s.mark}>{format(min + index * step)}</span>
              )}
            </i>
          ))}
        </div>
      </div>
      <div className={s.pointer} />
    </div>
  );
}
