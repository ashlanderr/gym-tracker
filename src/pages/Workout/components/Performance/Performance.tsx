import type { PerformanceProps } from "./types.ts";
import s from "./styles.module.scss";
import { MdAdd, MdCheck } from "react-icons/md";
import {
  useQuerySetsByPerformance,
  type Set,
  addSet,
} from "../../../../db/sets.ts";
import { type ReactNode } from "react";
import { useQueryPreviousPerformance } from "../../../../db/performances.ts";
import { useQueryExerciseById } from "../../../../db/exercises.ts";
import { SetRow } from "../SetRow";
import { generateFirestoreId } from "../../../../db/db.ts";

export function Performance({ performance }: PerformanceProps) {
  const exercise = useQueryExerciseById(performance.exercise);
  const sets = useQuerySetsByPerformance({ performance: performance.id });

  const prevPerformance = useQueryPreviousPerformance(
    performance.exercise,
    performance.startedAt,
  );

  const prevSets = useQuerySetsByPerformance({
    enabled: prevPerformance?.id !== undefined,
    performance: prevPerformance?.id,
  });

  const addSetHandler = async () => {
    await addSet({
      id: generateFirestoreId(),
      performance: performance.id,
      order: Math.max(-1, ...sets.map((s) => s.order)) + 1,
      type: "working",
      weight: 0,
      reps: 0,
      completed: false,
    });
  };

  return (
    <div className={s.exercise}>
      <div className={s.exerciseName}>{exercise?.name}</div>
      <table className={s.sets}>
        <thead>
          <tr>
            <th className={s.setNumHeader}>Подх.</th>
            <th className={s.prevVolumeHeader}>Пред.</th>
            <th className={s.currentWeightHeader}>КГ</th>
            <th className={s.currentRepsHeader}>Повт.</th>
            <th className={s.setCompletedHeader}>
              <MdCheck />
            </th>
          </tr>
        </thead>
        <tbody>{buildSets(sets, prevSets)}</tbody>
      </table>
      <button className={s.addSetButton} onClick={addSetHandler}>
        <MdAdd />
        Добавить сет
      </button>
    </div>
  );
}

function buildSets(sets: Set[], prevSets: Set[]): ReactNode[] {
  const prevWarmUp = prevSets.filter(
    (s) => s.type === "warm-up" && s.weight && s.reps,
  );
  const prevWorking = prevSets.filter(
    (s) => s.type === "working" && s.weight && s.reps,
  );
  const recommendations = buildRecommendations(prevWorking);
  const recWarmUp = recommendations.filter((s) => s.type === "warm-up");
  const recWorking = recommendations.filter((s) => s.type === "working");

  const result: ReactNode[] = [];
  let warmUpIndex = 0;
  let workingIndex = 0;

  sets.forEach((set) => {
    let number = "-";
    let prevSet: Set | undefined;
    let recSet: Set | undefined;

    if (set.type === "warm-up") {
      number = "W";
      prevSet = prevWarmUp[warmUpIndex];
      recSet = recWarmUp[warmUpIndex];
      warmUpIndex += 1;
    } else if (set.type === "working") {
      number = (workingIndex + 1).toString();
      prevSet = prevWorking[workingIndex];
      recSet = recWorking[workingIndex];
      workingIndex += 1;
    }

    result.push(
      <SetRow
        key={set.id}
        number={number}
        set={set}
        prevSet={prevSet}
        recSet={recSet}
      />,
    );
  });

  return result;
}

function buildRecommendations(workingSets: Set[]): Set[] {
  if (workingSets.length === 0) return [];

  let weight = Infinity;
  let reps = Infinity;

  for (const set of workingSets) {
    if (set.weight < weight) {
      weight = set.weight;
      reps = set.reps;
    } else if (set.weight === weight) {
      reps = Math.min(reps, set.reps);
    }
  }

  if (reps >= 12) {
    weight = Math.ceil(weight * 1.1);
    reps = 8;
  } else {
    reps = Math.min(reps + 2, 12);
  }

  const oneRepMax = weight * (1 + reps / 30);

  const newWarmUpSets: Set[] = [
    {
      id: "",
      performance: "",
      type: "warm-up",
      order: 0,
      weight: Math.floor(oneRepMax * 0.4),
      reps: 30,
      completed: true,
    },
    {
      id: "",
      performance: "",
      type: "warm-up",
      order: 1,
      weight: Math.floor(oneRepMax * 0.6),
      reps: 12,
      completed: true,
    },
  ];

  const newWorkingSets = workingSets.map((s, i) => ({
    ...s,
    order: i + 2,
    weight,
    reps,
  }));

  return [...newWarmUpSets, ...newWorkingSets];
}
