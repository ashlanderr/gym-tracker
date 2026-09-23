import s from "./styles.module.scss";
import { useEffect, useMemo, useRef } from "react";
import { clsx } from "clsx";
import { useDragScroll } from "../DragScroll";
import { ITEM_HEIGHT } from "./constants.ts";
import type { WheelProps } from "./types.ts";

// One column of a picker: the values roll past a fixed row in the middle,
// the way hours and minutes do. Only the value changing re-renders the list,
// so a fling costs a render per number rather than one per frame.
export function Wheel({
  min,
  max,
  step,
  value,
  units,
  format,
  onChange,
}: WheelProps) {
  const { ref, isDragging, handlers } = useDragScroll("y");
  const startRef = useRef(value);

  const values = useMemo(
    () =>
      Array.from(
        { length: Math.round((max - min) / step) + 1 },
        (_, i) => min + i * step,
      ),
    [min, max, step],
  );

  // Only the starting value is placed by us: afterwards the wheel is the
  // source of truth, and writing back what it just reported fights the thumb.
  useEffect(() => {
    const scroller = ref.current;
    if (scroller)
      scroller.scrollTop = ((startRef.current - min) / step) * ITEM_HEIGHT;
  }, [ref, min, step]);

  const scrollHandler = () => {
    const scroller = ref.current;
    if (!scroller) return;

    const index = Math.round(scroller.scrollTop / ITEM_HEIGHT);
    const next = Math.min(max, Math.max(min, min + index * step));
    if (next !== value) onChange(next);
  };

  return (
    <div className={s.root}>
      <div
        ref={ref}
        className={clsx(s.scroller, isDragging && s.dragging)}
        onScroll={scrollHandler}
        {...handlers}
      >
        <div className={s.list}>
          {values.map((item) => (
            <div
              key={item}
              className={clsx(s.item, item === value && s.current)}
            >
              {format(item)}
            </div>
          ))}
        </div>
      </div>
      {units && <div className={s.units}>{units}</div>}
    </div>
  );
}
