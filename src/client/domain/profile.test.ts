import * as Y from "yjs";
import { addMeasurement, queryProfile, type Store } from "../db";
import { queryLiftStrength } from "./levels";
import { completeOnboarding } from "./profile.ts";

function createStore(): Store {
  return { documentId: "test", personal: new Y.Doc() };
}

test("an onboarding pullup is read with the body weight given beside it", () => {
  const store = createStore();
  addMeasurement(store, {
    id: "earlier",
    user: "user",
    type: "weight",
    value: 100,
    createdAt: 500,
  });

  completeOnboarding(
    store,
    "user",
    {
      sex: "male",
      heightCm: 180,
      weightKg: 80,
      anchors: { pullup: { weight: 10, reps: 5 } },
    },
    1000,
  );

  const profile = queryProfile(store)!;
  expect(profile.anchors).toEqual({
    pullup: { weight: 10, reps: 5, createdAt: 1000 },
  });
  expect(queryLiftStrength(store, profile, "pullup", 2000).oneRepMax).toBe(
    90 * (1 + 5 / 30),
  );
});
