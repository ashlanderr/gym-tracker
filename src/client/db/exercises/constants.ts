import type { Exercise } from "./types.ts";
import { EXERCISE_FRAMES } from "./frames.generated.ts";

const crossFade = (frames: {
  start: string;
  end: string;
}): Exercise["asset"] => ({
  type: "cross-fade",
  startUrl: frames.start,
  endUrl: frames.end,
});

// Only exercises with their own artwork live here. The catalog is grown one
// exercise at a time as its pair of frames is drawn, rather than listing
// movements the app cannot illustrate.
export const EXERCISES: Record<string, Exercise> = {
  ["OvlOX8JCqg0lEuaPBU3G"]: {
    id: "OvlOX8JCqg0lEuaPBU3G",
    name: "Жим штанги лёжа",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "shoulders"],
    equipment: ["barbell", "bench"],
    load: { type: "barbell" },
    weight: { type: "full" },
    reps: { min: 6, max: 8 },
    asset: crossFade(EXERCISE_FRAMES.bench_press),
    alternatives: [
      {
        id: "sC31YlCwvicBjH6dbTTY",
        benefits: "больше нагрузки на верх груди",
      },
    ],
    instructions: [
      "Лопатки сведены и прижаты, стопы всей подошвой в полу.",
      "Опускай штангу к нижней части груди, локти под 45° к корпусу.",
      "Не отрывай таз от скамьи и не выключай локти в верхней точке.",
    ],
  },
  ["sC31YlCwvicBjH6dbTTY"]: {
    id: "sC31YlCwvicBjH6dbTTY",
    name: "Жим штанги лёжа на наклонной скамье",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["shoulders", "triceps"],
    equipment: ["barbell", "bench"],
    load: { type: "barbell" },
    weight: { type: "full" },
    reps: { min: 6, max: 8 },
    asset: crossFade(EXERCISE_FRAMES.incline_bench_press),
    alternatives: [
      {
        id: "OvlOX8JCqg0lEuaPBU3G",
        benefits: "больше рабочий вес",
      },
    ],
    instructions: [
      "Наклон скамьи 30–45°: выше — и работу забирают плечи.",
      "Опускай штангу к ключицам, а не к середине груди.",
      "Держи лопатки сведёнными, не проваливай плечи вперёд.",
    ],
  },
  ["7WHNH0KA8Fved2WkuQ1s"]: {
    id: "7WHNH0KA8Fved2WkuQ1s",
    name: "Тяга верхнего блока к груди",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["upper_back", "biceps", "forearms"],
    equipment: ["machine"],
    load: { type: "stack" },
    weight: { type: "full" },
    reps: { min: 10, max: 12 },
    asset: crossFade(EXERCISE_FRAMES.lat_pulldown),
    alternatives: [],
    instructions: [
      "Хват шире плеч, бёдра под валиками, корпус чуть отклонён назад.",
      "Тяни локтями вниз к рёбрам, доводя рукоять до верха груди.",
      "Не раскачивайся корпусом и не тяни рукоять за голову.",
    ],
  },
  ["TIei5nUKqsyTyJ6H64Il"]: {
    id: "TIei5nUKqsyTyJ6H64Il",
    name: "Подъём гантелей на бицепс",
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    equipment: ["dumbbell"],
    load: { type: "dumbbell", count: 2 },
    weight: { type: "full" },
    reps: { min: 10, max: 12 },
    asset: crossFade(EXERCISE_FRAMES.biceps_curl),
    alternatives: [
      {
        id: "OH3Eqq6aoMZgoPfoz5UG",
        benefits: "исключает раскачку корпусом",
      },
    ],
    instructions: [
      "Локти прижаты к корпусу и остаются на месте всё движение.",
      "Поднимай гантели за счёт бицепса, не подкидывая их корпусом.",
      "Опускай медленнее, чем поднимаешь, до полного выпрямления рук.",
    ],
  },
  ["OH3Eqq6aoMZgoPfoz5UG"]: {
    id: "OH3Eqq6aoMZgoPfoz5UG",
    name: "Сгибание рук на скамье Скотта",
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    equipment: ["barbell", "bench"],
    load: { type: "barbell" },
    weight: { type: "full" },
    reps: { min: 10, max: 12 },
    asset: crossFade(EXERCISE_FRAMES.preacher_curl),
    alternatives: [
      {
        id: "TIei5nUKqsyTyJ6H64Il",
        benefits: "если скамья Скотта занята",
      },
    ],
    instructions: [
      "Подмышки лежат на верхнем краю пюпитра, плечи не отрываются.",
      "Разгибай руки почти полностью, но не бросай вес в нижней точке.",
      "Не вставай с места и не помогай себе корпусом.",
    ],
  },
  ["P6WeZVykfwg8kSKaz5XC"]: {
    id: "P6WeZVykfwg8kSKaz5XC",
    name: "Разгибание рук на верхнем блоке",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    equipment: ["machine"],
    load: { type: "stack" },
    weight: { type: "full" },
    reps: { min: 10, max: 12 },
    asset: crossFade(EXERCISE_FRAMES.triceps_pushdown),
    alternatives: [],
    instructions: [
      "Локти прижаты к бокам и не двигаются вперёд-назад.",
      "Разгибай руки до конца, в нижней точке коротко напряги трицепс.",
      "Не наваливайся на рукоять корпусом, работай только предплечьями.",
    ],
  },
  ["Lr7Kq2VmXa9TdNbZ0sWc"]: {
    id: "Lr7Kq2VmXa9TdNbZ0sWc",
    name: "Махи гантелями в стороны",
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["traps"],
    equipment: ["dumbbell"],
    load: { type: "dumbbell", count: 2 },
    weight: { type: "full" },
    reps: { min: 12, max: 15 },
    asset: crossFade(EXERCISE_FRAMES.lateral_raise),
    alternatives: [],
    instructions: [
      "Лёгкий наклон корпуса вперёд, локти чуть согнуты и зафиксированы.",
      "Поднимай гантели до уровня плеч, ведя движение локтями.",
      "Не закидывай вес рывком и не поднимай плечи к ушам.",
    ],
  },
};
