import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useState } from "react";
import type { RepRange } from "../../domain";
import { type LadderSet, SetsLadder } from "../Notice/components/SetsLadder";
import { SetsStrip } from "../Notice/components/SetsStrip";

type Tone = "increase" | "decrease" | "mixed";

interface Example {
  kicker: string;
  tone: Tone;
  sets: Array<[number, number]>;
  today: number;
}

const RANGE: RepRange = { min: 10, max: 12 };

const TITLES: Record<Tone, string> = {
  increase: "Пора прибавить:",
  decrease: "Снизим до",
  mixed: "Начинаем с",
};

const EXAMPLES: Example[] = [
  {
    kicker: "Поиск веса",
    tone: "mixed",
    sets: [
      [20, 12],
      [40, 12],
      [60, 12],
    ],
    today: 60,
  },
  {
    kicker: "Поиск веса",
    tone: "mixed",
    sets: [
      [20, 12],
      [40, 10],
      [60, 4],
    ],
    today: 40,
  },
  {
    kicker: "Поиск веса",
    tone: "mixed",
    sets: [
      [20, 12],
      [40, 12],
      [60, 8],
      [50, 10],
    ],
    today: 50,
  },
  {
    kicker: "Вес найден",
    tone: "mixed",
    sets: [
      [20, 12],
      [40, 12],
      [40, 10],
    ],
    today: 40,
  },
  {
    kicker: "Вес найден",
    tone: "mixed",
    sets: [
      [50, 10],
      [40, 12],
      [40, 10],
    ],
    today: 40,
  },
  {
    kicker: "Попытка выше",
    tone: "mixed",
    sets: [
      [40, 12],
      [40, 12],
      [50, 6],
    ],
    today: 40,
  },
  {
    kicker: "Попытка выше",
    tone: "mixed",
    sets: [
      [40, 12],
      [40, 12],
      [50, 12],
    ],
    today: 50,
  },
  {
    kicker: "Провал веса",
    tone: "mixed",
    sets: [
      [40, 12],
      [40, 8],
      [35, 12],
      [35, 10],
    ],
    today: 35,
  },
  {
    kicker: "Провал веса",
    tone: "mixed",
    sets: [
      [40, 12],
      [40, 11],
      [40, 10],
      [35, 12],
    ],
    today: 35,
  },
  {
    kicker: "Откат",
    tone: "decrease",
    sets: [
      [40, 12],
      [40, 10],
      [40, 8],
    ],
    today: 37.5,
  },
  {
    kicker: "Новый вес",
    tone: "increase",
    sets: [
      [40, 12],
      [40, 12],
      [40, 12],
    ],
    today: 42.5,
  },
  {
    kicker: "Поиск веса, 6 подходов",
    tone: "mixed",
    sets: [
      [20, 12],
      [30, 12],
      [40, 12],
      [50, 12],
      [60, 9],
      [55, 10],
    ],
    today: 55,
  },
  {
    kicker: "Вес найден, 5 подходов",
    tone: "mixed",
    sets: [
      [62.5, 9],
      [57.5, 12],
      [57.5, 11],
      [57.5, 10],
      [57.5, 10],
    ],
    today: 57.5,
  },
];

const formatWeight = (weightKg: number) =>
  weightKg.toLocaleString("ru", { maximumFractionDigits: 2 });

// Two ways to draw the last time on a notice, on the examples of the rule of
// the working weight. Not a part of the app: a page to look at them on a
// phone.
export function NoticeMockup() {
  const [variant, setVariant] = useState<"ladder" | "strip">("ladder");
  const Chart = variant === "ladder" ? SetsLadder : SetsStrip;

  return (
    <div className={s.root}>
      <div className={s.switch}>
        <button
          className={clsx(variant === "ladder" && s.active)}
          onClick={() => setVariant("ladder")}
        >
          Лесенка
        </button>
        <button
          className={clsx(variant === "strip" && s.active)}
          onClick={() => setVariant("strip")}
        >
          Строка
        </button>
      </div>
      <div className={s.legend}>
        <span className={s.top}>12</span> верх
        <span>10</span> в диапазоне
        <span className={s.short}>8</span> ниже
        <span className={s.today}>10–12</span> сегодня
      </div>
      {EXAMPLES.map((example, index) => {
        const sets: LadderSet[] = example.sets.map(([weight, reps]) => ({
          weight,
          reps,
        }));
        return (
          <section key={index} className={clsx(s.card, s[example.tone])}>
            <div className={s.kicker}>{example.kicker}</div>
            <h2 className={s.title}>
              {TITLES[example.tone]} {formatWeight(example.today)} кг
            </h2>
            <Chart
              sets={sets}
              range={RANGE}
              today={example.today}
              formatWeight={formatWeight}
            />
          </section>
        );
      })}
    </div>
  );
}
