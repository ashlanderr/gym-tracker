import p from "../../../Workout/components/Performance/styles.module.scss";
import r from "../../../Workout/components/SetRow/styles.module.scss";
import t from "../../../Workout/components/PerformanceTimer/styles.module.scss";
import { clsx } from "clsx";
import { MdAdd, MdCheck, MdOutlineTimer } from "react-icons/md";
import { ExerciseThumb } from "../../../../components";
import { EXERCISES } from "../../../../db/exercises/constants.ts";
import type { MockExerciseProps } from "./types.ts";

// An exercise of the workout table drawn from the table's own styles, so a
// variant shows exactly what the table would look like without a workout.
export function MockExercise({
  id,
  sets,
  thumbClassName,
  thumb,
  isCompact,
  notice,
  weightCell,
}: MockExerciseProps) {
  const exercise = EXERCISES[id];

  return (
    <div className={p.exercise}>
      <div className={p.header}>
        <div className={thumbClassName}>
          {thumb ?? <ExerciseThumb exercise={exercise} />}
        </div>
        <div className={p.title}>
          <div className={p.exerciseName}>{exercise.name}</div>
          <span className={t.root}>
            <MdOutlineTimer className={t.icon} />
            <span>Таймер отдыха:</span>
            <span>2min 0s</span>
          </span>
        </div>
      </div>
      {notice}
      {!isCompact && (
        <>
          <table className={p.sets}>
            <thead>
              <tr>
                <th className={p.setNumHeader}>Подх.</th>
                <th className={p.prevVolumeHeader}>Пред.</th>
                <th className={p.currentWeightHeader}>KG</th>
                <th className={p.currentRepsHeader}>Повт.</th>
                <th className={p.setCompletedHeader}>
                  <MdCheck />
                </th>
              </tr>
            </thead>
            <tbody>
              {sets.map((set, index) => (
                <tr key={index} className={clsx(set.done && r.completed)}>
                  <td className={r.setNumValue}>
                    <span className={r.workingSet}>{set.number}</span>
                  </td>
                  <td className={r.prevVolumeValue}>{set.prev}</td>
                  <td className={r.currentWeightValue}>
                    {!set.done && weightCell ? (
                      weightCell
                    ) : (
                      <span className={clsx(r.value, !set.done && r.suggested)}>
                        {set.weight}
                      </span>
                    )}
                  </td>
                  <td className={r.currentRepsValue}>
                    <span className={clsx(r.value, !set.done && r.suggested)}>
                      {set.reps}
                    </span>
                  </td>
                  <td className={r.setCompletedValue}>
                    <span className={r.setCompletedButton}>
                      <MdCheck />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <span className={p.addSetButton}>
            <MdAdd />
            Добавить сет
          </span>
        </>
      )}
    </div>
  );
}
