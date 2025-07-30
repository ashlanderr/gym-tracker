import type { MuscleType } from "../db/exercises.ts";

export const MUSCLES_TRANSLATION: Record<MuscleType, string> = {
  abs: "Пресс",
  abductors: "Отводящие мышцы",
  adductors: "Приводящие мышцы",
  biceps: "Бицепсы",
  calves: "Икры",
  chest: "Грудь",
  forearms: "Предплечья",
  glutes: "Ягодицы",
  hamstrings: "Подколенные сухожилия",
  lats: "Широчайшие",
  lower_back: "Низ спины",
  neck: "Шея",
  quadriceps: "Квадрицепсы",
  shoulders: "Плечи",
  traps: "Трапеции",
  triceps: "Трицепсы",
  upper_back: "Верх спины",
};
