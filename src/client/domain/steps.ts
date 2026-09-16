import type { Performance, Set } from "../db";

// One set in the order the workout is performed, with its position among
// the sets of the same type within the exercise ("Подход 2 из 3").
export interface WorkoutStep {
  performance: Performance;
  set: Set;
  number: number;
  count: number;
  isLast: boolean;
}

export function buildWorkoutSteps(
  performances: Performance[],
  sets: Set[],
): WorkoutStep[] {
  const steps: WorkoutStep[] = [];

  const sortedPerformances = [...performances].sort(
    (a, b) => a.order - b.order,
  );

  for (const performance of sortedPerformances) {
    const performanceSets = sets
      .filter((s) => s.performance === performance.id)
      .sort((a, b) => a.order - b.order);

    for (const set of performanceSets) {
      const sameType = performanceSets.filter((s) => s.type === set.type);
      steps.push({
        performance,
        set,
        number: sameType.indexOf(set) + 1,
        count: sameType.length,
        isLast: false,
      });
    }
  }

  const last = steps.at(-1);
  if (last) last.isLast = true;

  return steps;
}

export function findCurrentStep(steps: WorkoutStep[]): WorkoutStep | undefined {
  return steps.find((step) => !step.set.completed);
}
