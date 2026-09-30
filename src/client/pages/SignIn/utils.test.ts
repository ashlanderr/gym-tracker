import { expect, it } from "vitest";
import { formatLastDate } from "./utils.ts";

const now = new Date(2026, 8, 30, 9).getTime();

it("names the two nearest days in words", () => {
  expect(formatLastDate(new Date(2026, 8, 30, 1).getTime(), now)).toBe(
    "сегодня",
  );
  expect(formatLastDate(new Date(2026, 8, 29, 23).getTime(), now)).toBe(
    "вчера",
  );
});

it("writes anything older as digits", () => {
  expect(formatLastDate(new Date(2026, 8, 28).getTime(), now)).toBe(
    "28.09.2026",
  );
  expect(formatLastDate(new Date(2024, 2, 4).getTime(), now)).toBe(
    "04.03.2024",
  );
});
