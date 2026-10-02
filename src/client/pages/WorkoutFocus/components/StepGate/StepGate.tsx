import { useAtom } from "jotai";
import { useModalStack, useStore } from "../../../../components";
import { queryExerciseById } from "../../../../db";
import {
  findMinimumConflict,
  isInventoryUnknown,
  isWarnedOfMinimum,
  replacePerformance,
  safeAlternatives,
} from "../../../../domain";
import { formatWeight, useStepPlan } from "../../hooks.ts";
import { KEPT_PERFORMANCES_ATOM } from "../../constants.ts";
import { InventoryView } from "../InventoryView";
import { WarningView } from "../WarningView";
import { ReplacePage } from "../ReplacePage";
import { SetView } from "../SetView";
import type { StepGateProps } from "./types.ts";

// What has to happen before the set: the inventory if the gym is unknown,
// then the warning if a novice meets a minimum heavier than the safe weight
// on an exercise without history. A replacement goes through the same
// checks again.
export function StepGate({ step }: StepGateProps) {
  const store = useStore();
  const { pushModal } = useModalStack();
  const [kept, setKept] = useAtom(KEPT_PERFORMANCES_ATOM);
  const plan = useStepPlan(step);

  if (!plan) return null;

  const { exercise, gym, profile, bodyWeight, exerciseSets } = plan.data;
  const { performance } = step;

  if (isInventoryUnknown(exercise, gym)) {
    return <InventoryView key={exercise.id} exercise={exercise} gym={gym} />;
  }

  const hasHistory = exerciseSets.some(
    (s) => s.completed && s.type !== "warm-up",
  );
  const isWarned =
    !hasHistory &&
    !kept.includes(performance.id) &&
    isWarnedOfMinimum(profile?.experience?.level);
  const minimum = isWarned
    ? findMinimumConflict(exercise, gym, profile?.sex, bodyWeight)
    : null;

  if (minimum === null) return <SetView step={step} />;

  const replaceHandler = async () => {
    const alternatives = exercise.alternatives.flatMap((alternative) => {
      const found = queryExerciseById(store, alternative.id);
      return found ? [{ ...alternative, exercise: found }] : [];
    });
    const chosen = await pushModal(ReplacePage, {
      exercise,
      alternatives: safeAlternatives(
        alternatives,
        gym,
        profile?.sex,
        bodyWeight,
      ),
    });
    if (chosen) replacePerformance(store, performance, chosen);
  };

  return (
    <WarningView
      exercise={exercise}
      minimum={formatWeight(plan, minimum)}
      onReplace={replaceHandler}
      onKeep={() => setKept([...kept, performance.id])}
    />
  );
}
