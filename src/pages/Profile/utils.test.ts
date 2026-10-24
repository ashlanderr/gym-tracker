import type { Measurement } from "../../db";
import { toTilePoints } from "./utils.ts";

function weighIn(date: Date, value: number): Measurement {
  return {
    id: date.toISOString(),
    user: "user",
    type: "weight",
    value,
    createdAt: date.getTime(),
  };
}

describe("tile chart", () => {
  const now = new Date(2026, 9, 24, 9).getTime();

  it("keeps only the last three months, oldest first", () => {
    const points = toTilePoints(
      [
        weighIn(new Date(2026, 9, 20), 80),
        weighIn(new Date(2026, 6, 25), 81),
        weighIn(new Date(2026, 6, 23), 82),
      ],
      now,
    );

    expect(points.map((p) => p.y)).toEqual([81, 80]);
  });
});
