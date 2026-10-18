import type { PerformanceProps } from "./types.ts";
import s from "./styles.module.scss";
import { MdAdd, MdCheck } from "react-icons/md";
import { MuscleFigure, useModalStack, useStore } from "../../../../components";
import { SetRow } from "../SetRow";
import { PerformanceActions } from "../PerformanceActions";
import { PerformanceTimer } from "../PerformanceTimer";
import { UNITS_TRANSLATION } from "../../../constants.ts";
import { addNextSet } from "../../../../domain";
import { usePerformanceSets } from "../../hooks.ts";

export function Performance({ performance, nextSetId }: PerformanceProps) {
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
      <button className={s.header} onClick={menuHandler}>
        <div className={s.picture}>
          <MuscleFigure muscles={exercise?.muscles ?? []} />
        </div>
        <span className={s.name}>{exercise?.name ?? "–"}</span>
      </button>
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
              startsRest={row.startsRest}
              isNext={row.set.id === nextSetId}
            />
          ))}
        </tbody>
      </table>
      <div className={s.footer}>
        <PerformanceTimer performance={performance} />
        <button className={s.addSetButton} onClick={addSetHandler}>
          <MdAdd />
          Добавить подход
        </button>
      </div>
    </div>
  );
}
