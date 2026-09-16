import type {
  EquipmentTag,
  ExerciseLoad,
  ExerciseWeight,
  MuscleType,
  RepRange,
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

export const EQUIPMENT_TRANSLATION: Record<EquipmentTag, string> = {
  barbell: "Штанга",
  dumbbell: "Гантели",
  machine: "Тренажёр",
  bench: "Скамья",
};

export const LOAD_TRANSLATION: Record<ExerciseLoad["type"], string> = {
  none: "Без веса",
  barbell: "Штанга",
  dumbbell: "Гантели",
  stack: "Блок",
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

export const REP_RANGE_PRESETS: RepRange[] = [
  { min: 6, max: 8 },
  { min: 8, max: 12 },
  { min: 10, max: 12 },
  { min: 12, max: 15 },
];

export const UNITS_TRANSLATION: Record<WeightUnits, string> = {
  kg: "KG",
  lbs: "LBS",
};

export const RECORDS_TRANSLATION: Record<RecordType, string> = {
  one_rep_max: "Лучший 1ПМ",
  weight: "Самый большой вес",
  volume: "Лучший объём",
};
