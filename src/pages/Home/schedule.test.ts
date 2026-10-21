import type { Workout } from "../../db";
import { buildPlan, formatRepeat } from "./schedule.ts";

function workout(id: string, day: Date, days = 7): Workout {
  return {
    id,
    user: "user",
    name: id,
    startedAt: day.getTime(),
    completedAt: day.getTime() + 3600_000,
    repeat: { id: "legs", from: "2026-10-05", days },
  };
}

function due(plan: ReturnType<typeof buildPlan>) {
  return Object.fromEntries(
    [...plan].map(([day, items]) => [
      day,
      items.map((p) => `${p.template.id}${p.missed ? " missed" : ""}`),
    ]),
  );
}

describe("plan", () => {
  it("is due after the latest repeat, and a passed due day is missed", () => {
    const plan = buildPlan(
      [
        workout("first", new Date(2026, 9, 5, 18)),
        workout("latest", new Date(2026, 9, 12, 18)),
      ],
      "2026-10-01",
      "2026-11-03",
      "2026-10-21",
    );

    expect(due(plan)).toEqual({
      "2026-10-19": ["latest missed"],
      "2026-10-26": ["latest"],
      "2026-11-02": ["latest"],
    });
  });

  it("keeps to the days of the rule when a repeat came late", () => {
    const plan = buildPlan(
      [workout("late", new Date(2026, 9, 14, 18), 4)],
      "2026-10-01",
      "2026-10-25",
      "2026-10-21",
    );

    expect(due(plan)).toEqual({
      "2026-10-17": ["late missed"],
      "2026-10-21": ["late"],
      "2026-10-25": ["late"],
    });
  });
});

describe("repeat label", () => {
  it("names the weekday of a weekly rule and counts the days of others", () => {
    expect(formatRepeat({ from: "2026-10-19", days: 7 })).toBe(
      "по понедельникам",
    );
    expect(formatRepeat({ from: "2026-10-19", days: 8 })).toBe("каждые 8 дней");
    expect(formatRepeat({ from: "2026-10-19", days: 3 })).toBe("каждые 3 дня");
  });
});
