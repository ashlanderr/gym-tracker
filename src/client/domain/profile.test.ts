import * as Y from "yjs";
import { queryLatestMeasurement, queryProfile, type Store } from "../db";
import { completeOnboarding } from "./profile.ts";

function createStore(): Store {
  return { documentId: "test", personal: new Y.Doc() };
}

test("onboarding dates the experience and the measurements with its end", () => {
  const store = createStore();

  completeOnboarding(
    store,
    "user",
    { sex: "female", heightCm: 165, weightKg: 60, experience: "novice" },
    1000,
  );

  expect(queryProfile(store)).toMatchObject({
    sex: "female",
    experience: { level: "novice", createdAt: 1000 },
  });
  expect(queryLatestMeasurement(store, "weight", 1000)?.value).toBe(60);
});
