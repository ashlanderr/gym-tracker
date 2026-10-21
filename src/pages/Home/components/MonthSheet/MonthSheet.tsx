import s from "./styles.module.scss";
import { useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { BottomSheet, type ModalProps } from "../../../../components";
import { DayCell } from "../DayCell";
import {
  buildMonth,
  dayKey,
  formatMonth,
  parseDayKey,
} from "../../calendar.ts";
import { WEEKDAY_FORMATTER } from "../../constants.ts";
import type { MonthSheetData } from "./types.ts";

// The way to a day far from the shown week: flip months, tap the day.
export function MonthSheet({
  data,
  onCancel,
  onSubmit,
}: ModalProps<MonthSheetData, string>) {
  const [month, setMonth] = useState(
    () => new Date(data.month.getFullYear(), data.month.getMonth(), 1),
  );
  const weeks = buildMonth(month.getFullYear(), month.getMonth());
  const today = parseDayKey(data.today);

  const flipHandler = (delta: number) => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  };

  return (
    <BottomSheet onClose={onCancel}>
      <div className={s.header}>
        <button className={s.flip} onClick={() => flipHandler(-1)}>
          <MdChevronLeft />
        </button>
        <div className={s.title}>{formatMonth(month, today)}</div>
        <button className={s.flip} onClick={() => flipHandler(1)}>
          <MdChevronRight />
        </button>
      </div>
      <div className={s.grid}>
        {weeks[0].map((date) => (
          <div key={date.getDay()} className={s.weekday}>
            {WEEKDAY_FORMATTER.format(date)}
          </div>
        ))}
        {weeks.flat().map((date) => {
          const key = dayKey(date);
          return (
            <DayCell
              key={key}
              date={date}
              mark={data.marks.get(key)}
              selected={key === data.selected}
              today={key === data.today}
              muted={date.getMonth() !== month.getMonth()}
              onClick={() => onSubmit(key)}
            />
          );
        })}
      </div>
    </BottomSheet>
  );
}
