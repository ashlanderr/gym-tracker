import {
  collection,
  deleteEntity,
  getEntity,
  insertEntity,
  useGetEntity,
  useQueryCollection,
} from "./db.ts";
import type { Store } from "./doc.ts";

// TODO
//
// Финальная идея:
// Пользователь выбирает при первом использовании что он хочет.
// Приложение формирует программу тренировок.
// Программа это набор запланированных Workout со всеми вложенными данными, как будто они уже пройдены.
// Приложение расставляет эти Workout по дням и выставляет в каждом период повтора в днях.
// Например: Legs - пн + 7 дней, Push - ср + 7 дней, Pull - пт + 7 дней.
// Нужно не только недели, но и поддержка 2/2 и других периодов - всё работает через кол-во дней целым числом.
// Например: Lower A + 8 days, Upper A + 8 days, rest, rest, Lower B + 8 days, Upper B + 8 days, rest, rest, [repeat]
// Ставим первые тренировки пользователю в календарь. Пропустил или выполнил - всё равно копируем/переносим тренировку на следующий период.
// Дальше просто копируем тренировки, пока пользователь не решит поменять программу.
// Смена программы это просто повтор того же алгоритма с сохранением предыдущих тренировок.
//
// Что делаем сейчас:
// Пока оставляем тренировки как есть, дублирование и календарь вручную.
// Всё лишнее удаляем: Periodization, Program.
//
// Когда появятся запланированные тренировки, у них будет startedAt в будущем.
// Запросы истории по startedAt должны будут отсекать незавершённые тренировки.
//
// Статистика проработки мышц для манекена не хранится, а считается на лету:
// за месяц это около сотни выполнений, медленно тут только полный скан коллекции.

export interface Workout {
  id: string;
  user: string;
  name: string;
  startedAt: number;
  completedAt: number | null;
  volume?: number;
  sets?: number;
  records?: number;
}

export function queryWorkoutById(store: Store, id: string): Workout | null {
  return getEntity(collection(store.personal, "workouts"), id);
}

export function useQueryWorkoutById(store: Store, id: string): Workout | null {
  return useGetEntity({
    collection: collection(store.personal, "workouts"),
    id,
    deps: [id],
  });
}

export function useQueryCompletedWorkouts(store: Store): Workout[] {
  const workouts = useQueryCollection<Workout>({
    collection: collection(store.personal, "workouts"),
    filter: {
      completedAt: { ne: null },
    },
    deps: [],
  });
  return [...workouts].sort((a, b) => b.startedAt - a.startedAt);
}

export function useQueryActiveWorkouts(store: Store): Workout[] {
  return useQueryCollection({
    collection: collection(store.personal, "workouts"),
    filter: {
      completedAt: { eq: null },
    },
    deps: [],
  });
}

export function addWorkout(store: Store, entity: Workout): Workout {
  insertEntity(collection(store.personal, "workouts"), entity);
  return entity;
}

export function updateWorkout(store: Store, entity: Workout): Workout {
  insertEntity(collection(store.personal, "workouts"), entity);
  return entity;
}

export function deleteWorkout(store: Store, entity: Workout) {
  deleteEntity(collection(store.personal, "workouts"), entity);
}
