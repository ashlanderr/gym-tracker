import {
  addMeasurement,
  type AnchorId,
  type AnchorSet,
  generateId,
  type Profile,
  saveProfile,
  type Sex,
  type Store,
} from "../db";

export interface OnboardingAnswers {
  sex: Sex;
  heightCm: number;
  weightKg: number;
  anchors: Partial<Record<AnchorId, Omit<AnchorSet, "createdAt">>>;
}

// Everything is written at one moment, so a remembered pullup meets exactly
// the body weight given with it.
export function completeOnboarding(
  store: Store,
  user: string,
  { sex, heightCm, weightKg, anchors }: OnboardingAnswers,
  now: number = Date.now(),
): Profile {
  addMeasurement(store, {
    id: generateId(),
    user,
    type: "height",
    value: heightCm,
    createdAt: now,
  });
  addMeasurement(store, {
    id: generateId(),
    user,
    type: "weight",
    value: weightKg,
    createdAt: now,
  });

  const dated: Profile["anchors"] = {};
  for (const [anchor, set] of Object.entries(anchors)) {
    dated[anchor as AnchorId] = { ...set, createdAt: now };
  }

  return saveProfile(store, { user, sex, anchors: dated, createdAt: now });
}
