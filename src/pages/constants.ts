import type {
  EquipmentType,
  ExerciseWeight,
  MuscleType,
  WeightUnits,
  RecordType,
} from "../db";

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
  machine: "Блок",
  plates: "Блины",
};

export const EXERCISE_WEIGHT_TRANSLATION: Record<
  ExerciseWeight["type"],
  string
> = {
  full: "Полный",
  negative: "Облегчение",
  positive: "Утяжеление",
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
