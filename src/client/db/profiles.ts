import { collection, getEntity, insertEntity, useGetEntity } from "./db.ts";
import type { Store } from "./doc.ts";

export type Sex = "male" | "female";

// Time in the gym says little about strength but much about knowing a bar
// and judging for oneself: novice is under half a year, intermediate up to
// two years, experienced more.
export type ExperienceLevel = "novice" | "intermediate" | "experienced";

// The date is kept though nothing reads it yet: half a year later a novice
// is no longer one, unless they never went to the gym.
export interface Experience {
  level: ExperienceLevel;
  createdAt: number;
}

// Who the person is. Height and body weight change over time and live in
// measurements.
export interface Profile {
  id: string;
  user: string;
  sex: Sex;
  experience: Experience;
  createdAt: number;
}

// One profile per person, under a fixed id.
const PROFILE_ID = "current";

export function queryProfile(store: Store): Profile | null {
  return getEntity<Profile>(collection(store.personal, "profiles"), PROFILE_ID);
}

export function useQueryProfile(store: Store): Profile | null {
  return useGetEntity<Profile>({
    collection: collection(store.personal, "profiles"),
    id: PROFILE_ID,
    deps: [],
  });
}

export function saveProfile(
  store: Store,
  profile: Omit<Profile, "id">,
): Profile {
  const entity = { ...profile, id: PROFILE_ID };
  insertEntity(collection(store.personal, "profiles"), entity);
  return entity;
}
