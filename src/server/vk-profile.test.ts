import { expect, it } from "vitest";
import { largerAvatar } from "./vk-profile.ts";

const BASE = "https://sun9-51.userapi.com/s/v1/ig2/photo.jpg?quality=95&ava=1";

it("asks VK for the smallest listed size that is sharp on the phone", () => {
  const avatar = `${BASE}&as=32x32,160x160,240x240,360x360,720x720&cs=50x50`;
  expect(new URL(largerAvatar(avatar)!).searchParams.get("cs")).toBe("360x360");
});

it("takes the largest size when none is large enough", () => {
  const avatar = `${BASE}&as=32x32,160x160&cs=50x50`;
  expect(new URL(largerAvatar(avatar)!).searchParams.get("cs")).toBe("160x160");
});

it("leaves an address without sizes alone", () => {
  expect(largerAvatar(`${BASE}&cs=50x50`)).toBe(`${BASE}&cs=50x50`);
});
