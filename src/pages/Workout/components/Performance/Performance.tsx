import type { PerformanceProps } from "./types.ts";
import s from "./styles.module.scss";
import { MdAdd, MdCheck } from "react-icons/md";
import { useModalStack, useStore } from "../../../../components";
import { SetRow } from "../SetRow";
import { PerformanceActions } from "../PerformanceActions";
import { PerformanceTimer } from "../PerformanceTimer";
import { UNITS_TRANSLATION } from "../../../constants.ts";
import { addNextSet } from "../../../../domain";
import { usePerformanceSets } from "../../hooks.ts";

export function Performance({ performance }: PerformanceProps) {
  const store = useStore();
  const { pushModal } = useModalStack();
  const { exercise, rows, units } = usePerformanceSets(performance);

  const addSetHandler = () => {
    addNextSet(store, performance);
  };

  const menuHandler = async () => {
    await pushModal(PerformanceActions, { performance, exercise });
  };

  return (
    <div className={s.exercise}>
      <div className={s.header}>
        <button className={s.name} onClick={menuHandler}>
          {exercise?.name ?? "–"}
        </button>
        <PerformanceTimer performance={performance} />
      </div>
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
              <span className={s.completedMark}>
                <MdCheck />
              </span>
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
