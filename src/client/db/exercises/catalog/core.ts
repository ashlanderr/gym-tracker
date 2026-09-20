import type { ExerciseGroup } from "./types.ts";

export const CORE_GROUPS: ExerciseGroup[] = [
  {
    exercises: {
      cable_crunch: {
        name: "Скручивания на верхнем блоке стоя на коленях",
        primaryMuscles: ["abs"],
        secondaryMuscles: [],
        equipment: ["cable"],
        load: { type: "stack" },
        reps: { min: 12, max: 15 },
        benefit: "пресс с весом, который видно и можно увеличивать",
        instructions: [
          "Встань на колени спиной к стойке, канат у висков.",
          "Скручивайся, подводя рёбра к тазу, а не наклоняясь корпусом.",
          "Держи таз неподвижным и не тяни вес руками.",
        ],
      },
      crunch_machine_stack: {
        name: "Скручивания в тренажёре сидя с блоком",
        primaryMuscles: ["abs"],
        secondaryMuscles: [],
        equipment: ["machine"],
        load: { type: "stack" },
        reps: { min: 12, max: 15 },
        benefit: "спина зафиксирована, легче почувствовать пресс",
        instructions: [
          "Отрегулируй сиденье: упор ложится на грудь, а не на шею.",
          "Скручивайся, укорачивая расстояние между рёбрами и тазом.",
          "Возвращайся медленно, не давая весу разогнуть тебя.",
        ],
      },
      crunch_machine_plates: {
        name: "Скручивания в тренажёре сидя с блинами",
        primaryMuscles: ["abs"],
        secondaryMuscles: [],
        equipment: ["machine"],
        load: { type: "plates", sides: 2 },
        reps: { min: 10, max: 15 },
        benefit: "тяжёлая версия, когда стека уже не хватает",
        instructions: [
          "Сядь, возьмись за ручки, упор на груди.",
          "Скручивайся вперёд подконтрольно, без рывка.",
          "Не тяни себя руками — они только удерживают ручки.",
        ],
      },
    },
  },
  {
    exercises: {
      hanging_leg_raise: {
        name: "Подъём ног в висе на турнике",
        primaryMuscles: ["abs"],
        secondaryMuscles: ["forearms", "quadriceps"],
        equipment: ["bodyweight"],
        load: { type: "none" },
        weight: { type: "positive", selfWeightPercent: 50 },
        reps: { min: 10, max: 15 },
        benefit: "нижний пресс и заодно хват",
        instructions: [
          "Повисни на прямых руках, плечи опущены, ноги вместе.",
          "Поднимай ноги, подкручивая таз вверх, а не просто сгибая бёдра.",
          "Не раскачивайся: если пошла раскачка — останови подход.",
        ],
      },
      captains_chair_leg_raise: {
        name: "Подъём ног в упоре на локтях",
        primaryMuscles: ["abs"],
        secondaryMuscles: ["quadriceps"],
        equipment: ["bodyweight"],
        load: { type: "none" },
        weight: { type: "positive", selfWeightPercent: 50 },
        reps: { min: 12, max: 15 },
        benefit: "то же движение, но хват не ограничивает",
        instructions: [
          "Упрись предплечьями в подушки, спина прижата к спинке.",
          "Поднимай колени к груди, подкручивая таз.",
          "Опускай ноги медленно, не отбивая их вниз.",
        ],
      },
      rotary_torso: {
        name: "Повороты корпуса в тренажёре сидя",
        primaryMuscles: ["abs"],
        secondaryMuscles: ["lower_back"],
        equipment: ["machine"],
        load: { type: "stack" },
        reps: { min: 12, max: 15 },
        benefit: "единственная нагрузка на косые с нормальным весом",
        instructions: [
          "Зафиксируй бёдра упорами, корпус прижми к подушке.",
          "Поворачивай корпус подконтрольно, таз остаётся на месте.",
          "Бери небольшой вес: поясница не любит скручивания с нагрузкой.",
        ],
      },
    },
  },
];
