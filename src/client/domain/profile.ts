import {
  addMeasurement,
  type AnchorId,
  type AnchorSet,
  generateId,
  type Profile,
  queryProfile,
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

export function changeSex(store: Store, sex: Sex) {
  const profile = queryProfile(store);
  if (profile) saveProfile(store, { ...profile, sex });
}

// A corrected answer is dated now, so a pullup meets today's body weight.
// No set means "не помню": the lift goes back to its default.
export function changeAnchorSet(
  store: Store,
  anchor: AnchorId,
  set: Omit<AnchorSet, "createdAt"> | null,
  now: number = Date.now(),
) {
  const profile = queryProfile(store);
  if (!profile) return;

  const anchors = { ...profile.anchors };
  if (set) {
    anchors[anchor] = { ...set, createdAt: now };
  } else {
    delete anchors[anchor];
  }
  saveProfile(store, { ...profile, anchors });
}
