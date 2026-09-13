import type { Exercise } from "./types.ts";

export const EXERCISES: Record<string, Exercise> = {
  ["tX9HxwCkIckqNaEaf2Dq"]: {
    id: "tX9HxwCkIckqNaEaf2Dq",
    muscles: ["chest"],
    name: "Бабочка в тренажёре",
    equipment: "machine",
  },
  ["Vfh6Q6Lu2cabxPEtWoqW"]: {
    id: "Vfh6Q6Lu2cabxPEtWoqW",
    name: "Боковой подъём в тренажёре",
    muscles: ["shoulders"],
    equipment: "machine",
  },
  ["dV1lK4mTcgk0hsXfiiLC"]: {
    id: "dV1lK4mTcgk0hsXfiiLC",
    name: "Вертикальная рычажная тяга в тренажёре",
    muscles: ["lats", "upper_back", "biceps", "forearms"],
    equipment: "machine",
  },
  ["B4KWg9mb2s04WbukIzDj"]: {
    id: "B4KWg9mb2s04WbukIzDj",
    muscles: ["lats", "biceps", "upper_back", "forearms"],
    name: "Вертикальная тяга обратным хватом в блоке",
    equipment: "machine",
    weight: {
      type: "full",
    },
  },
  ["AFfWN3dMGhlGyqOAwWXO"]: {
    id: "AFfWN3dMGhlGyqOAwWXO",
    muscles: ["lats", "upper_back", "biceps", "forearms"],
    name: "Вертикальная тяга узким хватом в блоке",
    equipment: "machine",
  },
  ["7WHNH0KA8Fved2WkuQ1s"]: {
    id: "7WHNH0KA8Fved2WkuQ1s",
    muscles: ["lats", "upper_back", "biceps", "forearms"],
    name: "Вертикальная тяга широким хватом в блоке",
    equipment: "machine",
    weight: {
      type: "full",
    },
  },
  ["mOgcynAZufVTTLxAiADV"]: {
    id: "mOgcynAZufVTTLxAiADV",
    name: "Выпады с гантелями",
    muscles: ["quadriceps", "glutes", "hamstrings"],
    equipment: "dumbbell",
    weight: {
      type: "positive",
      selfWeightPercent: 25,
    },
  },
  ["CH9xHvgvcnk3572Qh82q"]: {
    id: "CH9xHvgvcnk3572Qh82q",
    name: "Выпады со штангой",
    muscles: ["quadriceps", "hamstrings", "glutes"],
    equipment: "barbell",
    weight: {
      type: "positive",
      selfWeightPercent: 25,
    },
  },
  ["Af6NznR8fSOPx5OwlFPp"]: {
    id: "Af6NznR8fSOPx5OwlFPp",
    name: "Горизонтальная тяга в тренажёре на широчайшие",
    muscles: ["lats", "biceps", "upper_back"],
    equipment: "machine",
    weight: {
      type: "full",
    },
  },
  ["TKCpwpwjAtyQOCYMR4jG"]: {
    id: "TKCpwpwjAtyQOCYMR4jG",
    name: "Горизонтальная тяга узким хватом в блоке",
    muscles: ["upper_back", "lats", "biceps", "forearms"],
    equipment: "machine",
  },
  ["3bY5nU71Yn0AqqScQYUp"]: {
    id: "3bY5nU71Yn0AqqScQYUp",
    name: "Горизонтальный жим ногами в тренажёре",
    muscles: ["quadriceps", "hamstrings", "glutes"],
    equipment: "machine",
  },
  ["uTAoik0jk8O6L43JTxWm"]: {
    id: "uTAoik0jk8O6L43JTxWm",
    name: "Жим гантелей лёжа",
    muscles: ["chest", "triceps", "shoulders"],
    equipment: "dumbbell",
    weight: {
      type: "full",
    },
  },
  ["Lf2a6CaubEowWiwdb4R8"]: {
    id: "Lf2a6CaubEowWiwdb4R8",
    name: "Жим на грудь в тренажёре",
    muscles: ["chest", "triceps", "shoulders"],
    equipment: "machine",
    weight: {
      type: "full",
    },
  },
  ["h0rIMeYCULTorlXLyPYq"]: {
    id: "h0rIMeYCULTorlXLyPYq",
    name: "Жим на икры в тренажёре",
    muscles: ["calves"],
    equipment: "machine",
    weight: {
      type: "full",
    },
  },
  ["vhrOc6gI5BNTrfTPamHa"]: {
    id: "vhrOc6gI5BNTrfTPamHa",
    name: "Жим ногами в тренажёре",
    muscles: ["quadriceps", "glutes", "hamstrings"],
    equipment: "machine",
    weight: {
      type: "full",
    },
  },
  ["WQldUrMtFqTRt9Mt7fpT"]: {
    id: "WQldUrMtFqTRt9Mt7fpT",
    name: "Жим с плеч сидя в тренажёре с блинами",
    muscles: ["shoulders", "triceps"],
    equipment: "plates",
  },
  ["OvlOX8JCqg0lEuaPBU3G"]: {
    id: "OvlOX8JCqg0lEuaPBU3G",
    muscles: ["chest", "triceps", "shoulders"],
    name: "Жим штанги лёжа",
    equipment: "barbell",
  },
  ["6RvYYb7MsBwFBPOLQ7H7"]: {
    id: "6RvYYb7MsBwFBPOLQ7H7",
    name: "Наклонный жим в тренажёре",
    muscles: ["chest", "shoulders", "triceps"],
  },
  ["qH48LIq9CgYChb2N6EUM"]: {
    id: "qH48LIq9CgYChb2N6EUM",
    name: "Наклонный жим на икры в тренажёре с блинами",
    muscles: ["calves"],
    equipment: "plates",
    weight: {
      type: "full",
    },
  },
  ["Mu1R9Be1diBMSpxhbSAP"]: {
    id: "Mu1R9Be1diBMSpxhbSAP",
    muscles: ["chest", "triceps", "shoulders"],
    name: "Наклонный жим с гантелями",
    equipment: "dumbbell",
  },
  ["sC31YlCwvicBjH6dbTTY"]: {
    id: "sC31YlCwvicBjH6dbTTY",
    name: "Наклонный жим со штангой",
    muscles: ["chest", "shoulders", "triceps"],
    equipment: "barbell",
    weight: {
      type: "full",
    },
  },
  ["Nrpp8g2zRcs4qelsy9oy"]: {
    id: "Nrpp8g2zRcs4qelsy9oy",
    name: "Обратная разводка в кроссовере",
    muscles: ["shoulders"],
    equipment: "machine",
  },
  ["Q2movvKDbsVTORTCQ0xa"]: {
    id: "Q2movvKDbsVTORTCQ0xa",
    name: "Обратная разводка в тренажёре",
    muscles: ["shoulders"],
    equipment: "machine",
  },
  ["3RomG9bWZnkZGDDNV9eq"]: {
    id: "3RomG9bWZnkZGDDNV9eq",
    name: "Отведение бедра в тренажёре",
    muscles: ["abductors"],
    equipment: "machine",
  },
  ["P03Q501AwZPPL5s7sLN5"]: {
    id: "P03Q501AwZPPL5s7sLN5",
    name: "Отжимания на брусьях",
    muscles: ["chest", "triceps"],
    equipment: "plates",
    weight: {
      type: "positive",
      selfWeightPercent: 100,
    },
  },
  ["umxNlS7G9eB12A5ChgcZ"]: {
    id: "umxNlS7G9eB12A5ChgcZ",
    name: "Перекрестный подъём рук с тросом",
    muscles: ["shoulders"],
    equipment: "machine",
    weight: {
      type: "full",
    },
  },
  ["Wa6kyQhTiGRur6z8p7xZ"]: {
    id: "Wa6kyQhTiGRur6z8p7xZ",
    name: "Подтягивания нейтральным хватом",
    muscles: ["lats", "forearms", "biceps", "upper_back"],
    equipment: "none",
    weight: {
      type: "positive",
      selfWeightPercent: 100,
    },
  },
  ["7wGjDt7HL8RK8eu0Cfc7"]: {
    id: "7wGjDt7HL8RK8eu0Cfc7",
    name: "Подтягивания нейтральным хватом в гравитроне",
    muscles: ["lats", "upper_back", "forearms", "biceps"],
    equipment: "machine",
    weight: {
      type: "negative",
      selfWeightPercent: 100,
    },
  },
  ["I4ThGLxJyoXzcFdfFfpO"]: {
    id: "I4ThGLxJyoXzcFdfFfpO",
    name: "Подтягивания обратным хватом",
    muscles: ["lats", "upper_back", "biceps", "forearms"],
    equipment: "none",
    weight: {
      type: "positive",
      selfWeightPercent: 100,
    },
  },
  ["aPtSAO6ZEBZ2401nIDLK"]: {
    id: "aPtSAO6ZEBZ2401nIDLK",
    name: "Подтягивания обратным хватом в гравитроне",
    muscles: ["lats", "upper_back", "biceps", "forearms"],
    equipment: "machine",
    weight: {
      type: "positive",
      selfWeightPercent: 100,
    },
  },
  ["md6HLXAXou4SEwRPjssW"]: {
    id: "md6HLXAXou4SEwRPjssW",
    name: "Подтягивания прямым хватом",
    muscles: ["lats", "forearms", "biceps", "upper_back"],
    equipment: "none",
    weight: {
      type: "positive",
      selfWeightPercent: 100,
    },
  },
  ["RRsBEHSyiYyZ6KsCt2LE"]: {
    id: "RRsBEHSyiYyZ6KsCt2LE",
    name: "Подтягивания прямым хватом в гравитроне",
    muscles: ["lats", "biceps", "upper_back"],
    equipment: "machine",
    weight: {
      type: "negative",
      selfWeightPercent: 100,
    },
  },
  ["4X0R7S4Xf4Iov5NC6oI3"]: {
    id: "4X0R7S4Xf4Iov5NC6oI3",
    name: "Подъём на носки сидя с блинами",
    muscles: ["calves"],
    equipment: "plates",
    weight: {
      type: "full",
    },
  },
  ["tYCzxni00QUvnavXoGXf"]: {
    id: "tYCzxni00QUvnavXoGXf",
    name: "Приседания",
    muscles: ["quadriceps", "glutes"],
    equipment: "none",
    weight: {
      type: "positive",
      selfWeightPercent: 25,
    },
  },
  ["rwUri6ZQG6QTXGCvghCs"]: {
    id: "rwUri6ZQG6QTXGCvghCs",
    name: "Присяд в смитте",
    muscles: ["quadriceps", "glutes", "hamstrings"],
    equipment: "barbell",
    weight: {
      type: "positive",
      selfWeightPercent: 25,
    },
  },
  ["xxHwgWeeI6V29ktq6jA6"]: {
    id: "xxHwgWeeI6V29ktq6jA6",
    name: "Присяд с гантелью",
    muscles: ["quadriceps", "glutes", "hamstrings"],
    equipment: "dumbbell",
    weight: {
      type: "positive",
      selfWeightPercent: 25,
    },
  },
  ["Txx1kCEjSmank1XX1aCP"]: {
    id: "Txx1kCEjSmank1XX1aCP",
    name: "Присяд со штангой",
    muscles: ["quadriceps", "hamstrings", "glutes"],
    equipment: "barbell",
    weight: {
      type: "positive",
      selfWeightPercent: 25,
    },
  },
  ["P6WeZVykfwg8kSKaz5XC"]: {
    id: "P6WeZVykfwg8kSKaz5XC",
    name: "Разгибание рук на трицепс с канатом",
    muscles: ["triceps"],
    equipment: "machine",
  },
  ["z9zakVGsyY2ep6UjHK7p"]: {
    id: "z9zakVGsyY2ep6UjHK7p",
    name: "Разгибание спины с блинами",
    muscles: ["lower_back", "glutes"],
    equipment: "plates",
    weight: {
      type: "positive",
      selfWeightPercent: 25,
    },
  },
  ["ggcXFWpLVUYrGCjEp1Lv"]: {
    id: "ggcXFWpLVUYrGCjEp1Lv",
    name: "Румынская тяга с гантелями",
    muscles: ["glutes", "hamstrings", "lower_back", "upper_back", "lats"],
    equipment: "dumbbell",
  },
  ["MLuzrGdsEwJteUk0nruP"]: {
    id: "MLuzrGdsEwJteUk0nruP",
    name: "Румынская тяга со штангой",
    muscles: ["glutes", "hamstrings", "lower_back", "upper_back", "lats"],
    equipment: "barbell",
    weight: {
      type: "full",
    },
  },
  ["NMTsFqktmHGxma2iVRg5"]: {
    id: "NMTsFqktmHGxma2iVRg5",
    name: "Сведение бедра в тренажёре",
    muscles: ["adductors"],
    equipment: "machine",
  },
  ["EEK0B2o9CHg6ChdsvLwC"]: {
    id: "EEK0B2o9CHg6ChdsvLwC",
    name: "Сгибание ног лёжа в тренажёре",
    muscles: ["hamstrings", "calves"],
    equipment: "machine",
    weight: {
      type: "full",
    },
  },
  ["UDtwGTMbaOl6S0ISzCIR"]: {
    id: "UDtwGTMbaOl6S0ISzCIR",
    name: "Сгибание рук молотком с гантелями",
    muscles: ["biceps", "forearms"],
    equipment: "dumbbell",
    weight: {
      type: "full",
    },
  },
  ["OH3Eqq6aoMZgoPfoz5UG"]: {
    id: "OH3Eqq6aoMZgoPfoz5UG",
    name: "Сгибание рук на бицепс в тренажёре Скотта",
    muscles: ["biceps"],
    equipment: "machine",
    weight: {
      type: "full",
    },
  },
  ["7WCTbCIAHhMaImG1FdCN"]: {
    id: "7WCTbCIAHhMaImG1FdCN",
    name: "Сгибание рук с EZ-штангой на бицепс",
    muscles: ["biceps"],
    equipment: "barbell",
  },
  ["TIei5nUKqsyTyJ6H64Il"]: {
    id: "TIei5nUKqsyTyJ6H64Il",
    name: "Сгибание рук с гантелями на бицепс",
    muscles: ["biceps"],
    equipment: "dumbbell",
    weight: {
      type: "full",
    },
  },
  ["0wWn5uJfI6Ge8znBQdYG"]: {
    id: "0wWn5uJfI6Ge8znBQdYG",
    name: "Сгибание рук со штангой на бицепс",
    muscles: ["biceps"],
    equipment: "barbell",
    weight: {
      type: "full",
    },
  },
  ["hmOdrzGUqGptmXEwWqnP"]: {
    id: "hmOdrzGUqGptmXEwWqnP",
    name: "Скручивания в тренажёре с блинами",
    muscles: ["abs"],
    equipment: "plates",
  },
  ["qgjsNpa5H5b9kK8LrJNX"]: {
    id: "qgjsNpa5H5b9kK8LrJNX",
    name: "Скручивания с блинами",
    muscles: ["abs"],
    equipment: "plates",
    weight: {
      type: "positive",
      selfWeightPercent: 25,
    },
  },
  ["IVaM6rdC8hATlS2eCeYB"]: {
    id: "IVaM6rdC8hATlS2eCeYB",
    name: "Становая тяга с гантелями",
    muscles: [
      "glutes",
      "hamstrings",
      "lats",
      "quadriceps",
      "lower_back",
      "upper_back",
      "traps",
    ],
    equipment: "dumbbell",
    weight: {
      type: "full",
    },
  },
  ["CrFwcUXnZwW86TyzXato"]: {
    id: "CrFwcUXnZwW86TyzXato",
    name: "Становая тяга со штангой",
    muscles: [
      "glutes",
      "hamstrings",
      "quadriceps",
      "lower_back",
      "upper_back",
      "lats",
      "traps",
    ],
    equipment: "barbell",
    weight: {
      type: "full",
    },
  },
  ["2ObehYShK7vnWiyokEwt"]: {
    id: "2ObehYShK7vnWiyokEwt",
    name: "Тяга на наклонной скамье с гантелями",
    muscles: ["upper_back", "lats", "biceps", "forearms"],
    equipment: "dumbbell",
    weight: {
      type: "full",
    },
  },
  ["XVzH36BNcxpFRe8zloJ8"]: {
    id: "XVzH36BNcxpFRe8zloJ8",
    name: "Французский жим лёжа с гантелями",
    muscles: ["triceps"],
    equipment: "dumbbell",
  },
};
