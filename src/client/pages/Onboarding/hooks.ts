import { type PointerEvent, useRef, useState } from "react";

// Scrolling scales are the browser's own, so inertia and snapping come for
// free on a phone. A mouse has neither and cannot flick sideways at all, so
// it drags the strip by hand — and mandatory snapping, which would fight the
// pointer on every pixel, is off until the button comes back up.
export function useDragScroll(axis: "x" | "y") {
  const ref = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ from: number; offset: number } | null>(null);
  const [isDragging, setDragging] = useState(false);

  const pointOf = (e: PointerEvent) => (axis === "x" ? e.clientX : e.clientY);

  const offsetOf = (element: HTMLDivElement) =>
    axis === "x" ? element.scrollLeft : element.scrollTop;

  const scrollTo = (element: HTMLDivElement, offset: number) => {
    if (axis === "x") {
      element.scrollLeft = offset;
    } else {
      element.scrollTop = offset;
    }
  };

  const endDrag = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
  };

  return {
    ref,
    isDragging,
    handlers: {
      onPointerDown: (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        dragRef.current = { from: pointOf(e), offset: offsetOf(ref.current) };
        setDragging(true);
        ref.current.setPointerCapture(e.pointerId);
      },
      onPointerMove: (e: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag || !ref.current) return;
        scrollTo(ref.current, drag.offset - (pointOf(e) - drag.from));
      },
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
