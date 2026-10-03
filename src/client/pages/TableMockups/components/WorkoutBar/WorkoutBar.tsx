import s from "./styles.module.scss";
import { MdArrowBack } from "react-icons/md";
import type { WorkoutBarProps } from "./types.ts";

// What the whole workout is at: how long it goes and how much is left.
export function WorkoutBar({ time, done, total }: WorkoutBarProps) {
  return (
    <div className={s.root}>
      <div className={s.row}>
        <span className={s.back}>
          <MdArrowBack />
        </span>
        <div className={s.status}>
          <div className={s.time}>{time}</div>
          <div className={s.count}>
            {done} из {total} подходов
          </div>
        </div>
        <span className={s.finish}>Закончить</span>
      </div>
      <div className={s.progress}>
        <i style={{ width: `${(done / total) * 100}%` }} />
      </div>
    </div>
  );
}
