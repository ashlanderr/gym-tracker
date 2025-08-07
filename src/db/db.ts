/* eslint-disable */
import * as Y from "yjs";
import { useEffect, useMemo, useState } from "react";

interface Entity {
  id: string;
}

type Op<T> = { eq: T } | { in: T[] } | { ne: T } | { lt: T } | { le: T };

type Filter<E> = {
  [K in keyof E]?: Op<E[K]>;
};

export type Collection = Y.Map<Y.Map<any>>;

export function collection(doc: Y.Doc, collection: string): Collection {
  return doc.getMap(collection);
}

export function queryCollection<E extends Entity>(
  collection: Collection,
  filter: Filter<Exclude<E, "id">>,
): E[] {
  const result: E[] = [];

  for (const [id, data] of collection) {
    let match = true;

    for (const key in filter) {
      const value = data.get(key);
      const op = filter[key];
      if (op) {
        if ("eq" in op) {
          match &&= value === op.eq;
        } else if ("ne" in op) {
          match &&= value !== op.ne;
        } else if ("in" in op) {
          match &&= op.in.includes(value);
        } else if ("lt" in op) {
          match &&= value < op.lt;
        } else if ("le" in op) {
          match &&= value <= op.le;
        }
      }
    }

    if (match) {
      result.push({ id, ...data.toJSON() } as E);
    }
  }

  return result;
}

export interface QueryCollectionOptions<E extends Entity> {
  collection: Collection;
  filter: Filter<Exclude<E, "id">>;
  deps: any[];
}

export function useQueryCollection<E extends Entity>({
  collection,
  filter,
  deps,
}: QueryCollectionOptions<E>): E[] {
  const initial = useMemo(() => queryCollection(collection, filter), deps);
  const [updated, setUpdated] = useState<E[] | null>(null);

  useEffect(() => {
    const observer = () => {
      setUpdated(queryCollection(collection, filter));
    };
    observer();
    collection.observe(observer);
    return () => {
      collection.unobserve(observer);
      setUpdated(null);
    };
  }, deps);

  return updated ?? initial;
}

export function getEntity<E extends Entity>(
  collection: Collection,
  id: string,
): E | null {
  const entity = collection.get(id);
  return entity ? ({ id, ...entity.toJSON() } as E) : null;
}

export interface GetEntityOptions {
  collection: Collection;
  id: string;
  deps: any[];
}

export function useGetEntity<E extends Entity>({
  collection,
  id,
  deps,
}: GetEntityOptions): E | null {
  const initial = useMemo(() => getEntity<E>(collection, id), deps);
  const [updated, setUpdated] = useState<E | null>(null);

  useEffect(() => {
    setUpdated(null);
    const observer = () => {
      setUpdated(getEntity<E>(collection, id));
    };
    collection.observe(observer);
    return () => collection.unobserve(observer);
  }, deps);

  return updated ?? initial ?? null;
}

export function insertEntity<E extends Entity>(
  collection: Collection,
  entity: E,
) {
  const { id, ...data } = entity;
  collection.set(entity.id, new Y.Map(Object.entries(data)));
}

export function deleteEntity<E extends Entity>(
  collection: Collection,
  entity: E,
) {
  collection.delete(entity.id);
}

export function maxBy<E>(
  entities: E[],
  comparator: (a: E, b: E) => number,
): E | null {
  if (entities.length === 0) return null;
  let result = entities[0];

  for (let i = 1; i < entities.length; ++i) {
    const entity = entities[i];
    if (comparator(entity, result) > 0) {
      result = entity;
    }
  }

  return result;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateId(): string {
  const array = new Uint8Array(20);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => CHARS[byte % CHARS.length]).join("");
}
