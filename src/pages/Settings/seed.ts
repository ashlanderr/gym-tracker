import {
  addWorkout,
  generateId,
  querySetsByPerformance,
  type Store,
  updateSet,
} from "../../db";
import { addPerformance, completeWorkout } from "../../domain";
import { SEED_DAYS_AGO, SEED_PLANS } from "./constants.ts";

// Finished workouts on past days, for trying the calendar out on a local
// account while developing. Each one goes through the same steps as a real
// workout, so it opens and counts like one.
export function seedWorkouts(store: Store, user: string) {
  SEED_DAYS_AGO.forEach((daysAgo, i) => {
    const plan = SEED_PLANS[i % SEED_PLANS.length];
    const startedAt = new Date();
    startedAt.setDate(startedAt.getDate() - daysAgo);
    startedAt.setHours(18 + (i % 3), 15 * (i % 4), 0, 0);

    const workout = addWorkout(store, {
      id: generateId(),
      user,
      name: plan.name,
      startedAt: startedAt.getTime(),
      completedAt: startedAt.getTime() + (50 + i * 3) * 60_000,
    });

    for (const { exercise, weight, reps } of plan.exercises) {
      const performance = addPerformance(store, workout, exercise);
      const [set] = querySetsByPerformance(store, performance.id);
      for (let order = 0; order < 3; order++) {
        updateSet(store, {
          ...set,
          id: order === 0 ? set.id : generateId(),
          order,
          weight,
          reps: reps - order,
          completed: true,
        });
      }
    }

    completeWorkout(store, workout, plan.name);
  });
}
