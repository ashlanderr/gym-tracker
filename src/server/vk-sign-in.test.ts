import { describe, expect, it } from "vitest";
import { isAppReturnUrl } from "./vk-sign-in.ts";

describe("VK sign-in return url", () => {
  it("accepts the app deep link and the web build", () => {
    expect(isAppReturnUrl("ru.ashlanderr.gymtracker://sign-in")).toBe(true);
    expect(isAppReturnUrl("http://localhost:5173/#/settings")).toBe(true);
  });

  it("rejects a foreign page", () => {
    expect(isAppReturnUrl("https://evil.example/#/settings")).toBe(false);
    expect(isAppReturnUrl("https://localhost.evil.example/")).toBe(false);
    expect(isAppReturnUrl("not a url")).toBe(false);
  });
});
