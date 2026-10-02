import {
  addMeasurement,
  type ExperienceLevel,
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
  experience: ExperienceLevel;
}

export function completeOnboarding(
  store: Store,
  user: string,
  { sex, heightCm, weightKg, experience }: OnboardingAnswers,
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

  return saveProfile(store, {
    user,
    sex,
    experience: { level: experience, createdAt: now },
    createdAt: now,
  });
}

export function changeSex(store: Store, sex: Sex) {
  const profile = queryProfile(store);
  if (profile) saveProfile(store, { ...profile, sex });
}
