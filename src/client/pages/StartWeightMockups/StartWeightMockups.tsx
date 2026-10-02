import s from "./styles.module.scss";
import { Fragment, type ReactNode } from "react";
import { MdArrowForward } from "react-icons/md";
import { Phone } from "./components";
import {
  InventoryScreen,
  ReplaceScreen,
  SetScreen,
  WarningScreen,
  WeightSheetScreen,
} from "./screens.tsx";

interface Step {
  caption: string;
  note?: string;
  screen: ReactNode;
  overlay?: ReactNode;
  action?: string;
}

function Flow({
  title,
  children,
  steps,
}: {
  title: string;
  children: ReactNode;
  steps: Step[];
}) {
  return (
    <section className={s.flow}>
      <h2>{title}</h2>
      <div className={s.text}>{children}</div>
      <div className={s.row}>
        {steps.map((step, index) => (
          <Fragment key={index}>
            <Phone
              caption={step.caption}
              note={step.note}
              overlay={step.overlay}
            >
              {step.screen}
            </Phone>
            {step.action && (
              <div className={s.arrow}>
                <MdArrowForward />
                <span>{step.action}</span>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

const BARBELL_INVENTORY = (
  <InventoryScreen
    id="bench_press"
    title="Что есть в зале?"
    text="Блины и грифы общие на весь зал, поэтому их нужно указать всего один раз."
    rows={[
      {
        label: "Грифы",
        hint: "Отметь и лёгкие, если есть: с них проще начать.",
        options: [5, 7.5, 10, 15, 20],
        selected: [20],
      },
      {
        label: "Блины",
        options: [1.25, 2.5, 5, 10, 15, 20, 25],
        selected: [1.25, 2.5, 5, 10, 15, 20, 25],
      },
    ]}
  />
);

const DUMBBELL_INVENTORY = (
  <InventoryScreen
    id="dumbbell_bench_press"
    title="Какие гантели в зале?"
    text="Гантели общие на весь зал, поэтому их нужно указать всего один раз."
    rows={[
      { label: "Самая лёгкая", options: [1, 2, 2.5, 4, 5], selected: [2] },
      {
        label: "Самая тяжёлая",
        options: [10, 20, 30, 40, 50, 60],
        selected: [30],
      },
      {
        label: "Шаг",
        hint: "Разница между соседними весами.",
        options: [1, 2, 2.5, 5],
        selected: [2],
      },
    ]}
  />
);

const DUMBBELL_SET = (
  <SetScreen id="dumbbell_bench_press" weight="4" reps={10} target="8 – 12" />
);

const SIZES = [
  { width: 320, height: 640 },
  { width: 360, height: 780 },
  { width: 412, height: 915 },
];

export function StartWeightMockups() {
  return (
    <div className={s.root}>
      <header className={s.intro}>
        <h1>Первый вес упражнения</h1>
        <p>
          Отдельной страницы старта нет. Если вес упражнения неизвестен, сразу
          открывается обычный экран подхода на стартовом весе из
          <code> safe-weights.md</code>, а у тренажёров — на минимуме снаряда.
          Разминки от такого веса нет, поэтому первым человек всегда видит
          первый рабочий подход. Опытный поправит число, новичок начнёт так.
          Если человек поднял вес, при закрытии шторки перед подходом
          вставляется разминка от нового веса.
        </p>
        <p>
          До подхода может быть только два экрана: инвентарь, если зал ещё не
          знаем, и предупреждение — когда минимум снаряда тяжелее безопасного
          веса. Предупреждение — вопрос «заменить или оставить», список замен на
          следующем экране. В замены попадают только упражнения без того же
          конфликта: другая штанга снова начнётся с пустого грифа.
        </p>
      </header>

      <Flow
        title="Мужчина, жим лёжа"
        steps={[
          {
            caption: "Инвентарь",
            note: "Только если зал ещё не знаем.",
            screen: BARBELL_INVENTORY,
            action: "Дальше",
          },
          {
            caption: "Подход",
            note: "Безопасный вес — 20, это гриф. Конфликта нет.",
            screen: (
              <SetScreen id="bench_press" weight="20" reps={8} target="6 – 8" />
            ),
          },
        ]}
      >
        Обычный путь.
      </Flow>

      <Flow
        title="Опытный, жим лёжа"
        steps={[
          {
            caption: "Подход",
            note: "Знает, что жмёт 60, и не хочет тратить время на подбор.",
            screen: (
              <SetScreen id="bench_press" weight="20" reps={8} target="6 – 8" />
            ),
            action: "Тап по весу",
          },
          {
            caption: "Шторка веса",
            note: "Строка меняется с каждым нажатием: на 20 её нет, на 30 — «25 × 2», с 40 — оба подхода.",
            screen: (
              <SetScreen id="bench_press" weight="60" reps={8} target="6 – 8" />
            ),
            overlay: (
              <WeightSheetScreen
                id="bench_press"
                weightKg={60}
                warmUps={["30 × 8", "50 × 2"]}
              />
            ),
            action: "Закрыть",
          },
          {
            caption: "Разминка",
            note: "Переход как после «Сделал». Полоска сверху длиннее на два деления.",
            screen: (
              <SetScreen
                id="bench_press"
                weight="30"
                reps={8}
                target="6 – 8"
                sets={11}
                warmUp={{ number: 1, count: 2, workingKg: 60 }}
              />
            ),
          },
        ]}
      >
        Разминка от стартового веса пустая: 50% и 85% легче грифа. Человек
        поднимает вес в шторке и сразу видит, какая разминка появится; при
        закрытии шторки подходы разминки вставляются перед рабочим.
      </Flow>

      <Flow
        title="Девушка, жим лёжа, только гриф 20"
        steps={[
          {
            caption: "Инвентарь",
            screen: BARBELL_INVENTORY,
            action: "Дальше",
          },
          {
            caption: "Предупреждение",
            note: "Вес — о чём речь, заголовок — что это значит, текст — что делать.",
            screen: <WarningScreen id="bench_press" minimum={20} />,
            action: "Заменить",
          },
          {
            caption: "Замена",
            note: "Только альтернативы без того же конфликта.",
            screen: <ReplaceScreen id="bench_press" />,
            action: "Жим гантелей лёжа",
          },
          {
            caption: "Инвентарь гантелей",
            note: "Если гантелей зал ещё не знает.",
            screen: DUMBBELL_INVENTORY,
            action: "Дальше",
          },
          {
            caption: "Подход",
            note: "Безопасный вес — по 3, гантели с шагом 2: по 2. Пара — 4.",
            screen: DUMBBELL_SET,
          },
        ]}
      >
        Перед подходом — вопрос «заменить или оставить».
      </Flow>

      <Flow
        title="Подтягивания, новичок"
        steps={[
          {
            caption: "Предупреждение",
            note: "Внешнего веса нет — вместо «+0 кг» знак и другая причина.",
            screen: <WarningScreen id="pull_up_wide" minimum={0} />,
            action: "Заменить",
          },
          {
            caption: "Замена",
            screen: <ReplaceScreen id="pull_up_wide" />,
          },
        ]}
      >
        Тот же экран, когда минимум — свой вес.
      </Flow>

      <section className={s.flow}>
        <h2>Переносы на разных экранах</h2>
        <div className={s.text}>
          Маленький, обычный и большой Android. Текст выровнен по строкам (
          <code>text-wrap: balance</code>), поэтому ни на одной ширине не
          остаётся слова в одиночку.
        </div>
        <div className={s.row}>
          {SIZES.map((size) => (
            <Phone
              key={size.width}
              caption={`${size.width} × ${size.height}`}
              size={size}
            >
              <WarningScreen id="bench_press" minimum={20} />
            </Phone>
          ))}
          {SIZES.map((size) => (
            <Phone
              key={`pull-up-${size.width}`}
              caption={`${size.width} × ${size.height}`}
              size={size}
            >
              <WarningScreen id="pull_up_wide" minimum={0} />
            </Phone>
          ))}
        </div>
      </section>
    </div>
  );
}
