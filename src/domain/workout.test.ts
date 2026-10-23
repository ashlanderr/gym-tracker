import * as Y from "yjs";
import { addWorkout, queryWorkoutById, type Store, type Workout } from "../db";
import {
  addWorkout as startWorkout,
  completeWorkout,
  duplicateWorkout,
  setWorkoutRepeat,
} from "./workout.ts";

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

describe("workout on a past day", () => {
  afterEach(() => vi.useRealTimers());

  it("lasts as long as it took to write down", () => {
    const s = store();
    vi.useFakeTimers({ now: new Date(2026, 9, 23, 18, 30) });
    const workout = startWorkout(s, "user", 3);
    vi.advanceTimersByTime(20 * 60_000);

    const done = completeWorkout(s, workout, "Lower A");

    expect(new Date(done.startedAt)).toEqual(new Date(2026, 9, 20, 18, 30));
    expect(done.completedAt! - done.startedAt).toBe(20 * 60_000);
  });
});
