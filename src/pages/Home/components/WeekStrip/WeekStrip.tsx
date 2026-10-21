import s from "./styles.module.scss";
import { useLayoutEffect, useRef } from "react";
import { DayCell } from "../DayCell";
import { dayKey } from "../../calendar.ts";
import { WEEKDAY_FORMATTER } from "../../constants.ts";
import type { WeekStripProps } from "./types.ts";

// One week per screen, swiped like pages. The page shown is controlled from
// outside, so the header can jump to a day and the swipes are reported back.
export function WeekStrip({
  weeks,
  week,
  selected,
  today,
  marks,
  onSelect,
  onWeekChange,
}: WeekStripProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useRef(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (Math.round(element.scrollLeft / element.clientWidth) !== week) {
      element.scrollTo({
        left: week * element.clientWidth,
        behavior: shown.current ? "smooth" : "instant",
      });
    }
    shown.current = true;
  }, [week]);

  const scrollHandler = () => {
    const element = ref.current;
    if (!element) return;
    onWeekChange(Math.round(element.scrollLeft / element.clientWidth));
  };

  return (
    <div className={s.root} ref={ref} onScroll={scrollHandler}>
      {weeks.map((days) => (
        <div key={dayKey(days[0])} className={s.week}>
          {days.map((date) => {
            const key = dayKey(date);
            return (
              <DayCell
                key={key}
                date={date}
                weekday={WEEKDAY_FORMATTER.format(date)}
                mark={marks.get(key)}
                selected={key === selected}
                today={key === today}
                onClick={() => onSelect(key)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
