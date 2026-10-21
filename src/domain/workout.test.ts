import * as Y from "yjs";
import { addWorkout, queryWorkoutById, type Store, type Workout } from "../db";
import { duplicateWorkout, setWorkoutRepeat } from "./workout.ts";

function store(): Store {
  return { personal: new Y.Doc(), hasServer: false };
}

function workout(store: Store, id: string, startedAt: number): Workout {
  return addWorkout(store, {
    id,
    user: "user",
    name: "Lower A",
    startedAt,
    completedAt: startedAt + 1,
    repeat: { id: "legs", from: "2026-10-19", days: 7 },
  });
}

describe("workout repeat", () => {
  it("changes the rule on the latest repeat", () => {
    const s = store();
    const old = workout(s, "old", 1);
    workout(s, "new", 2);

    setWorkoutRepeat(s, old, { from: "2026-10-20", days: 8 });

    expect(queryWorkoutById(s, "new")?.repeat).toEqual({
      id: "legs",
      from: "2026-10-20",
      days: 8,
    });
    expect(queryWorkoutById(s, "old")?.repeat?.days).toBe(7);
  });

  it("stops on every repeat", () => {
    const s = store();
    const old = workout(s, "old", 1);
    workout(s, "new", 2);

    setWorkoutRepeat(s, old, null);

    expect(queryWorkoutById(s, "old")?.repeat).toBeUndefined();
    expect(queryWorkoutById(s, "new")?.repeat).toBeUndefined();
  });

  it("goes on in a copy", () => {
    const s = store();
    const copy = duplicateWorkout(s, workout(s, "old", 1));

    expect(copy.repeat?.id).toBe("legs");
  });
});
