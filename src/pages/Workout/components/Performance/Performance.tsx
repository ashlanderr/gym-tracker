import type { PerformanceProps } from "./types.ts";
import s from "./styles.module.scss";
import { MdAdd, MdCheck } from "react-icons/md";
import { useStore } from "../../../../components";
import { SetRow } from "../SetRow";
import { UNITS_TRANSLATION } from "../../../constants.ts";
import { addNextSet } from "../../../../domain";
import { usePerformanceSets } from "../../hooks.ts";

// The sets table of one exercise, as it was on the single workout page.
export function Performance({ performance }: PerformanceProps) {
  const store = useStore();
  const { exercise, rows, units } = usePerformanceSets(performance);

  const addSetHandler = () => {
    addNextSet(store, performance);
  };

  return (
    <div className={s.exercise}>
      <table className={s.sets}>
        <thead>
          <tr>
            <th className={s.setNumHeader}>Подх.</th>
            <th className={s.prevVolumeHeader}>Пред.</th>
            <th className={s.currentWeightHeader}>
              {UNITS_TRANSLATION[units]}
            </th>
            <th className={s.currentRepsHeader}>Повт.</th>
            <th className={s.setCompletedHeader}>
              <MdCheck />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <SetRow
              key={row.set.id}
              exercise={exercise}
              performance={performance}
              units={units}
              number={row.number}
              set={row.set}
              prevSet={row.prevSet}
              recSet={row.recSet}
            />
          ))}
        </tbody>
      </table>
      <button className={s.addSetButton} onClick={addSetHandler}>
        <MdAdd />
        Добавить подход
      </button>
    </div>
  );
}
