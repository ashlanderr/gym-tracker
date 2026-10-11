import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MARQUEE_PAUSE, MARQUEE_SPEED } from "./constants.ts";
import type { MarqueeProps } from "./types.ts";

export function Marquee({ children }: MarqueeProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [overflow, setOverflow] = useState(0);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const text = textRef.current;
    if (!root || !text) return;

    const measure = () =>
      setOverflow(Math.max(0, Math.ceil(text.scrollWidth - root.clientWidth)));

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(text);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const text = textRef.current;
    if (!text || overflow === 0) return;

    const move = (overflow / MARQUEE_SPEED) * 1000;
    const duration = 2 * (move + MARQUEE_PAUSE);
    const hold = MARQUEE_PAUSE / duration;
    const start = "translateX(0)";
    const end = `translateX(${-overflow}px)`;

    const animation = text.animate(
      [
        { transform: start, offset: 0 },
        { transform: start, offset: hold },
        { transform: end, offset: 0.5 },
        { transform: end, offset: 0.5 + hold },
        { transform: start, offset: 1 },
      ],
      { duration, iterations: Infinity, easing: "linear" },
    );
    return () => animation.cancel();
  }, [overflow]);

  return (
    <div className={clsx(s.root, overflow > 0 && s.moving)} ref={rootRef}>
      <span className={s.text} ref={textRef}>
        {children}
      </span>
    </div>
  );
}
