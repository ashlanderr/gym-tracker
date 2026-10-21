import type { Workout } from "../../db";
import { buildDayMarks, buildMonth, buildWeeks, dayKey } from "./calendar.ts";

function keys(weeks: Date[][]): string[][] {
  return weeks.map((week) => week.map(dayKey));
}

function workout(startedAt: Date, completed: boolean): Workout {
  return {
    id: startedAt.toISOString(),
    user: "user",
    name: "Тренировка",
    startedAt: startedAt.getTime(),
    completedAt: completed ? startedAt.getTime() + 3600_000 : null,
  };
}

describe("weeks of the strip", () => {
  it("run from Monday to Sunday and cover both ends", () => {
    const weeks = keys(
      buildWeeks(new Date(2026, 9, 21), new Date(2026, 10, 2)),
    );

    expect(weeks).toEqual([
      [
        "2026-10-19",
        "2026-10-20",
        "2026-10-21",
        "2026-10-22",
        "2026-10-23",
        "2026-10-24",
        "2026-10-25",
      ],
      [
        "2026-10-26",
        "2026-10-27",
        "2026-10-28",
        "2026-10-29",
        "2026-10-30",
        "2026-10-31",
        "2026-11-01",
      ],
      [
        "2026-11-02",
        "2026-11-03",
        "2026-11-04",
        "2026-11-05",
        "2026-11-06",
        "2026-11-07",
        "2026-11-08",
      ],
    ]);
  });

  it("put a Sunday at the end of its week", () => {
    const weeks = keys(
      buildWeeks(new Date(2026, 9, 25), new Date(2026, 9, 25)),
    );

    expect(weeks).toHaveLength(1);
    expect(weeks[0][0]).toBe("2026-10-19");
  });
});

describe("month grid", () => {
  it("covers the month with whole weeks", () => {
    const weeks = keys(buildMonth(2026, 1));

    expect(weeks[0][0]).toBe("2026-01-26");
    expect(weeks.at(-1)?.at(-1)).toBe("2026-03-01");
  });
});

describe("day marks", () => {
  it("mark days with finished and active workouts", () => {
    const marks = buildDayMarks([
      workout(new Date(2026, 9, 19, 18), true),
      workout(new Date(2026, 9, 21, 9), true),
      workout(new Date(2026, 9, 21, 19), false),
    ]);

    expect(Object.fromEntries(marks)).toEqual({
      "2026-10-19": "done",
      "2026-10-21": "active",
    });
  });
});
