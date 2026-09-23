import {
  collection,
  deleteEntity,
  getEntity,
  insertEntity,
  maxBy,
  queryCollection,
  useGetEntity,
  useQueryCollection,
} from "./db.ts";
import type { Store } from "./doc.ts";
import type { RepRange } from "./exercises";

export interface Performance {
  id: string;

  user: string;

  workout: string;

  exercise: string;

  // ID позиции упражнения внутри программы тренировок.
  // Позволяет собрать историю выполнения для рекомендаций.
  // Веса и повторы зависят от того, какие упражнения уже были в тренировке,
  // поэтому нельзя использовать общую историю упражнения.
  // Копируется без изменения при дублировании тренировки.
  // Выдаётся новый при создании нового выполнения упражнения внутри тренировки
  // и при замене упражнения: новое упражнение берёт историю по упражнению в целом.
  slot: string;

  // Порядок внутри тренировки.
  order: number;

  // Дупликация времени старта тренировки для оптимизации запросов.
  startedAt: number;

  // Базовый диапазон повторов. По умолчанию берётся из упражнения.
  // Для разных выполнений одного упражнения внутри программы может быть разным, поэтому он тут.
  // Если инвентарь не позволяет повысить вес при достижении верха диапазона,
  // то расширяется в большую сторону до красивых значений.
  reps: RepRange;

  // Время таймера в секундах.
  timer?: number;
}

export function queryPerformanceById(
  store: Store,
  id: string,
): Performance | null {
  return getEntity(collection(store.personal, "performances"), id);
}

export function useQueryPerformanceById(
  store: Store,
  id: string,
): Performance | null {
  return useGetEntity({
    collection: collection(store.personal, "performances"),
    id,
    deps: [id],
  });
}

export function queryPerformancesByWorkout(
  store: Store,
  workout: string,
): Performance[] {
  const performances = queryCollection<Performance>(
    collection(store.personal, "performances"),
    {
      workout: { eq: workout },
    },
  );
  return [...performances].sort((a, b) => a.order - b.order);
}

export function useQueryPerformancesByWorkout(
  store: Store,
  workout: string,
): Performance[] {
  const performances = useQueryCollection<Performance>({
    collection: collection(store.personal, "performances"),
    filter: {
      workout: { eq: workout },
    },
    deps: [workout],
  });
  return [...performances].sort((a, b) => a.order - b.order);
}

// The latest performance of the slot, or of the exercise in general
// when the slot has no history yet.
export function queryPreviousPerformance(
  store: Store,
  slot: string,
  exercise: string,
  startedAt: number,
): Performance | null {
  const entities = queryCollection<Performance>(
    collection(store.personal, "performances"),
    {
      exercise: { eq: exercise },
      startedAt: { lt: startedAt },
    },
  );
  return selectPreviousPerformance(entities, slot);
}

export function useQueryPreviousPerformance(
  store: Store,
  slot: string,
  exercise: string,
  startedAt: number,
): Performance | null {
  const entities = useQueryCollection<Performance>({
    collection: collection(store.personal, "performances"),
    filter: {
      exercise: { eq: exercise },
      startedAt: { lt: startedAt },
    },
    deps: [exercise, startedAt],
  });
  return selectPreviousPerformance(entities, slot);
}

function selectPreviousPerformance(
  performances: Performance[],
  slot: string,
): Performance | null {
  const byDate = (a: Performance, b: Performance) => a.startedAt - b.startedAt;
  return (
    maxBy(
      performances.filter((p) => p.slot === slot),
      byDate,
    ) ?? maxBy(performances, byDate)
  );
}

export function queryPerformancesSince(
  store: Store,
  since: number,
): Performance[] {
  return queryCollection(collection(store.personal, "performances"), {
    startedAt: { ge: since },
  });
}

export function queryPerformancesByExercise(
  store: Store,
  exercise: string,
): Performance[] {
  return queryCollection(collection(store.personal, "performances"), {
    exercise: { eq: exercise },
  });
}

export function useQueryPerformancesByExercise(
  store: Store,
  exercise: string,
): Performance[] {
  return useQueryCollection({
    collection: collection(store.personal, "performances"),
    filter: {
      exercise: { eq: exercise },
    },
    deps: [exercise],
  });
}

export function addPerformance(store: Store, entity: Performance): Performance {
  insertEntity(collection(store.personal, "performances"), entity);
  return entity;
}

export function updatePerformance(
  store: Store,
  entity: Performance,
): Performance {
  insertEntity(collection(store.personal, "performances"), entity);
  return entity;
}

export function deletePerformance(store: Store, entity: Performance) {
  deleteEntity(collection(store.personal, "performances"), entity);
}
