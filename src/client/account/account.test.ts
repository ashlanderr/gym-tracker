import { beforeEach, describe, expect, it } from "vitest";
import { getAccountId, setAccountId } from "./account.ts";

function installStorage() {
  const values = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
    clear: () => values.clear(),
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() {
      return values.size;
    },
  };
}

describe("account id", () => {
  beforeEach(installStorage);

  it("keeps the generated id across calls", () => {
    const first = getAccountId();
    expect(getAccountId()).toBe(first);
  });

  it("generates a different id for a device that has none", () => {
    const first = getAccountId();
    installStorage();
    expect(getAccountId()).not.toBe(first);
  });

  it("takes over the id set by hand", () => {
    getAccountId();
    setAccountId("existing-account");
    expect(getAccountId()).toBe("existing-account");
  });
});
