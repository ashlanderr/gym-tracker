import s from "./styles.module.scss";
import { clsx } from "clsx";
import { type ReactNode, useState } from "react";
import { MdAdd, MdCheck, MdRemove } from "react-icons/md";
import { BottomSheet, type ModalProps } from "../../../../components";
import { formatDay, parseDayKey } from "../../calendar.ts";
import { MAX_REPEAT_DAYS, WEEKDAYS_PLURAL } from "../../constants.ts";
import { formatRepeat, nextDue } from "../../schedule.ts";
import type {
  RepeatMode,
  ScheduleSheetData,
  ScheduleSheetResult,
} from "./types.ts";

// A workout repeats every week on its weekday or every few days, counting
// from its day. Seven days is the weekly rule, whichever way it was picked.
export function ScheduleSheet({
  data,
  onCancel,
  onSubmit,
}: ModalProps<ScheduleSheetData, ScheduleSheetResult>) {
  const current = data.workout.repeat?.days;
  const [mode, setMode] = useState<RepeatMode>(
    !current ? "none" : current === 7 ? "weekly" : "days",
  );
  const [days, setDays] = useState(current && current !== 7 ? current : 2);
  const weekday = WEEKDAYS_PLURAL[parseDayKey(data.from).getDay()];
  const rule =
    mode === "none"
      ? null
      : { from: data.from, days: mode === "weekly" ? 7 : days };
  const today = parseDayKey(data.today);

  return (
    <BottomSheet onClose={onCancel}>
      <div className={s.header}>
        <div className={s.title}>Расписание</div>
        <div className={s.subtitle}>{data.workout.name}</div>
      </div>
      <div className={s.options}>
        <Option
          selected={mode === "none"}
          label="Не повторять"
          onClick={() => setMode("none")}
        />
        <Option
          selected={mode === "weekly"}
          label="Каждую неделю"
          note={weekday}
          onClick={() => setMode("weekly")}
        />
        <Option
          selected={mode === "days"}
          label="Каждые несколько дней"
          note={mode === "days" ? undefined : "Например, раз в 8 дней"}
          onClick={() => setMode("days")}
        >
          {mode === "days" && (
            <div className={s.stepper} onClick={(e) => e.stopPropagation()}>
              <button
                className={s.step}
                disabled={days <= 2}
                onClick={() => setDays(days - 1)}
              >
                <MdRemove />
              </button>
              <div className={s.days}>
                {formatRepeat({ from: data.from, days })}
              </div>
              <button
                className={s.step}
                disabled={days >= MAX_REPEAT_DAYS}
                onClick={() => setDays(days + 1)}
              >
                <MdAdd />
              </button>
            </div>
          )}
        </Option>
      </div>
      <div className={s.footer}>
        {(rule || current) && (
          <div className={s.next}>
            {rule
              ? `Следующая — ${formatDay(nextDue(rule, data.today), today).toLowerCase()}`
              : "В календаре останутся только прошедшие"}
          </div>
        )}
        <button className={s.save} onClick={() => onSubmit({ rule })}>
          Сохранить
        </button>
      </div>
    </BottomSheet>
  );
}

function Option({
  selected,
  label,
  note,
  children,
  onClick,
}: {
  selected: boolean;
  label: string;
  note?: string;
  children?: ReactNode;
  onClick: () => void;
}) {
  return (
    <div className={clsx(s.option, selected && s.selected)} onClick={onClick}>
      <div className={s.optionRow}>
        <div className={s.optionText}>
          <div className={s.label}>{label}</div>
          {note && <div className={s.note}>{note}</div>}
        </div>
        {selected && <MdCheck className={s.check} />}
      </div>
      {children}
    </div>
  );
}
