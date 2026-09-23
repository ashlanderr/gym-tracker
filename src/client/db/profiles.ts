import { collection, getEntity, insertEntity, useGetEntity } from "./db.ts";
import type { Store } from "./doc.ts";

export type Sex = "male" | "female";

// The four lifts that stand for somebody's strength as a whole.
export type AnchorId = "bench" | "squat" | "deadlift" | "pullup";

// One remembered set, kept as it was answered: the one-rep max is ours to
// derive, and the formula may change. For pullups the weight is what hangs
// on the belt, negative when a machine helps. Each set carries its own date,
// so a pullup meets the body weight of the day it was answered.
export interface AnchorSet {
  weight: number;
  reps: number;
  createdAt: number;
}

// Who the person is. Only what was answered is stored: a lift left out stays
// out, and its default is read from the code, so a corrected default reaches
// everybody who never answered. Height and body weight change over time and
// live in measurements.
export interface Profile {
  id: string;
  user: string;
  sex: Sex;
  anchors: Partial<Record<AnchorId, AnchorSet>>;
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
