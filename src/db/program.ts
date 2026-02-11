import type { Store } from "./doc.ts";
import {
  collection,
  insertEntity,
  useGetEntity,
  useQueryCollection,
} from "./db.ts";

export interface Program {
  id: string;
  name: string;
}

export function useQueryProgramById(store: Store, id: string): Program | null {
  return useGetEntity({
    collection: collection(store.personal, "programs"),
    id,
    deps: [id],
  });
}

export function useQueryAllPrograms(store: Store): Program[] {
  return useQueryCollection({
    collection: collection(store.personal, "programs"),
    filter: {},
    deps: [],
  });
}

export function addProgram(store: Store, entity: Program): Program {
  insertEntity(collection(store.personal, "programs"), entity);
  return entity;
}
