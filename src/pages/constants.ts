import type { EquipmentType, MuscleType } from "../db/exercises.ts";
import type { WeightUnits } from "../db/performances.ts";
import type { RecordType } from "../db/records.ts";

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

export const EQUIPMENT_TRANSLATION: Record<EquipmentType, string> = {
  none: "Нет",
  barbell: "Штанга",
  dumbbell: "Гантели",
  machine: "Тренажёр",
  plates: "Блины",
};

export const UNITS_TRANSLATION: Record<WeightUnits, string> = {
  kg: "KG",
  lbs: "LBS",
};

export const RECORDS_TRANSLATION: Record<RecordType, string> = {
  one_rep_max: "Лучший 1ПМ",
  weight: "Самый большой вес",
  volume: "Лучший объём",
};
