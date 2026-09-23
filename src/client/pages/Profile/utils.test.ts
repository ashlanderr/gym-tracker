import { formatAgo, formatChange, formatDay, formatMeasure } from "./utils.ts";

const NOW = new Date(2026, 8, 23, 9, 0).getTime();

test("a weigh-in reads as days ago for a week and as a date after", () => {
  expect(formatAgo(new Date(2026, 8, 23, 7, 0).getTime(), NOW)).toBe("сегодня");
  expect(formatAgo(new Date(2026, 8, 22, 23, 30).getTime(), NOW)).toBe("вчера");
  expect(formatAgo(new Date(2026, 8, 19, 12, 0).getTime(), NOW)).toBe(
    "4 дня назад",
  );
  expect(formatAgo(new Date(2026, 8, 10, 12, 0).getTime(), NOW)).toBe(
    "10 сентября",
  );
});

test("a date from another year says the year", () => {
  expect(formatDay(new Date(2025, 11, 31).getTime(), NOW)).toMatch(/2025/);
});

test("measurements keep their precision and a change carries its sign", () => {
  expect(formatMeasure(82.5, "weight")).toBe("82,5 кг");
  expect(formatMeasure(80, "weight")).toBe("80 кг");
  expect(formatMeasure(180, "height")).toBe("180 см");
  expect(formatChange(-0.4, "weight")).toBe("−0,4 кг");
  expect(formatChange(1, "height")).toBe("+1 см");
});
