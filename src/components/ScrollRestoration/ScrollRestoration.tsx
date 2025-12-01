import { useLocation } from "react-router";
import { useEffect, useLayoutEffect, useRef } from "react";

const SCROLL_POSITION: Record<string, number> = {};

export function useScrollRestoration() {
  const location = useLocation();
  const locationRef = useRef(location.key);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  locationRef.current = location.key;

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const listener = () => {
      SCROLL_POSITION[locationRef.current] = scrollElement.scrollTop;
    };

    scrollElement.addEventListener("scroll", listener);

    return () => {
      scrollElement.removeEventListener("scroll", listener);
    };
  }, []);

  useLayoutEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    scrollElement.scrollTo({
      top: SCROLL_POSITION[locationRef.current] ?? 0,
      behavior: "instant",
    });
  }, []);

  return { scrollRef };
}
