import { describe, expect, it } from "vitest";
import { formatNumber } from "./number.ts";

describe("formatNumber", () => {
  it("separates decimals with a dot and thousands with a space", () => {
    expect(formatNumber(12345.5, { maximumFractionDigits: 1 })).toBe(
      "12 345.5",
    );
  });
});
