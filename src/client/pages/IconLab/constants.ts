import type { IconColors, IconVariant, Paint } from "./types.ts";

const DARK = "#111214";
const WHITE = "#ffffff";
const YELLOW = "#F5B83D";
const BLUE = "#3D8BFF";
const FLAME: Paint = ["#FFD166", "#FF7A1A"];

const paint = (
  background: Paint,
  infinity: Paint,
  barbell: Paint,
  swooshes: Paint = infinity,
): IconColors => ({
  background,
  parts: { loops: infinity, swooshes, bar: barbell, plates: barbell },
});

export const ICON_VARIANTS: IconVariant[] = [
  {
    name: "Сейчас",
    note: "Белый на сером",
    ...paint("#383838", WHITE, WHITE),
  },
  {
    name: "Жёлтый символ",
    note: "Одноцветный, палитра приложения",
    ...paint(DARK, YELLOW, YELLOW),
  },
  {
    name: "Жёлтый фон",
    note: "Одноцветный, самый заметный на полке",
    ...paint(YELLOW, DARK, DARK),
  },
  {
    name: "Жёлтая штанга",
    note: "Бесконечность белая, штанга — рекорд",
    ...paint(DARK, WHITE, YELLOW),
  },
  {
    name: "Жёлтая бесконечность",
    note: "Штанга белая, акцент на прогрессе",
    ...paint(DARK, YELLOW, WHITE),
  },
  {
    name: "Жёлтые завитки",
    note: "Акцент только внутри петель",
    ...paint(DARK, WHITE, WHITE, YELLOW),
  },
  {
    name: "Синяя штанга",
    note: "Второй акцент приложения",
    ...paint(DARK, WHITE, BLUE),
  },
  {
    name: "Жёлтый фон, белая штанга",
    note: "Двухцветный на светлом фоне",
    ...paint(YELLOW, DARK, WHITE),
  },
  {
    name: "Пламя",
    note: "Бесконечность с переходом в оранжевый",
    ...paint(DARK, FLAME, WHITE),
  },
];
