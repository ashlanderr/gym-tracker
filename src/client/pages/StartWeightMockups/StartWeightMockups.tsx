import s from "./styles.module.scss";
import { Fragment, type ReactNode } from "react";
import { MdArrowForward } from "react-icons/md";
import { Phone } from "./components";
import {
  InventoryScreen,
  OwnWeightSheet,
  ReplaceScreen,
  RestScreen,
  SetScreen,
  StartScreen,
} from "./screens.tsx";

interface Step {
  caption: string;
  note?: string;
  screen: ReactNode;
  overlay?: ReactNode;
  action?: string;
}

function Flow({
  id,
  title,
  children,
  steps,
}: {
  id: string;
  title: string;
  children: ReactNode;
  steps: Step[];
}) {
  return (
    <section className={s.flow} id={id}>
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

const jump = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const FLOWS = [
  ["bench-novice", "Жим: новичок"],
  ["bench-woman", "Жим: девушка-новичок"],
  ["bench-own", "Жим: знаю свой вес"],
  ["dumbbells", "Гантели"],
  ["pull-up", "Подтягивания"],
  ["assisted", "Гравитрон"],
  ["squat", "Присед"],
  ["preacher", "Скотт в тренажёре"],
];

const SPOTTER = "Нужна страховка или упоры";

const GYM_KNOWN = "Гриф 20 кг · блины 1,25–25";

const STACK_TEXT =
  "У каждого тренажёра свои плитки, поэтому их нужно указать для него отдельно.";

const TOP_PLATE = {
  label: "Верхняя плитка",
  hint: "Число на самой верхней плитке.",
};

const STEP = {
  label: "Шаг",
  hint: "На сколько отличаются соседние плитки.",
};

export function StartWeightMockups() {
  return (
    <div className={s.root}>
      <header className={s.intro}>
        <h1>Первый вес упражнения</h1>

        <p>
          Когда у упражнения нет истории, вместо экрана подхода открывается
          выбор старта. Перед ним — инвентарь, если зал или тренажёр ещё не
          знаем. Правила — в <code>docs/recommendations/README.md</code>, раздел
          «Первый вес», числа — в <code>safe-weights.md</code>.
        </p>

        <h3>Как устроено</h3>
        <ol>
          <li>
            <b>Три кнопки у любого упражнения</b>, одинаково выровненные, с
            иконками: «С лёгкого веса» (по умолчанию), «Знаю свой вес»,
            «Заменить упражнение».
          </li>
          <li>
            <b>Лёгкий вес</b>: у штанги и гантелей — безопасный вес по полу, у
            тренажёров — верхняя плитка или пустые стержни, у своего веса — +0.
          </li>
          <li>
            <b>Страховка — строкой в первой кнопке</b>, только если безопасный
            вес пришлось поднять до минимума снаряда у жима лёжа или приседа.
            Без запретов и подтверждений.
          </li>
          <li>
            <b>Похожие упражнения</b> — в шторке «Знаю свой вес», по лучшему
            подходу прошлой тренировки, в том же виде, что на экране подхода.
          </li>
          <li>
            <b>В подборе четыре оценки</b>: «Мало», «Легко», «Норм», «Тяжело».
          </li>
          <li>
            <b>Замена</b> — альтернативы из каталога. Посреди упражнения она уже
            есть на странице упражнения, по тапу на название.
          </li>
        </ol>

        <nav className={s.toc}>
          {FLOWS.map(([id, title]) => (
            <button key={id} onClick={() => jump(id)}>
              {title}
            </button>
          ))}
        </nav>
      </header>

      <Flow
        id="bench-novice"
        title="Жим лёжа: новичок, зал не настроен"
        steps={[
          {
            caption: "1. Инвентарь",
            note: "Типичное уже отмечено, обычно хватает «Дальше».",
            screen: (
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
            ),
            action: "Дальше",
          },
          {
            caption: "2. Старт",
            note: "Безопасный вес мужчины в жиме — 20, ровно гриф. Строки про страховку нет.",
            screen: <StartScreen id="bench_press" lightest="20 кг" />,
            action: "С лёгкого веса",
          },
          {
            caption: "3. Подход",
            screen: (
              <SetScreen
                id="bench_press"
                line="Подбор веса · подход 1 из 3"
                tone="pick"
                weight="20"
                reps={8}
                target="6 – 8"
              />
            ),
            action: "Сделал",
          },
          {
            caption: "4. Отдых",
            screen: (
              <RestScreen
                selected="Мало"
                main="40 кг × 8"
                sub="Подбор веса · подход 2 из 3"
                note="Было мало — вес вдвое"
              />
            ),
          },
        ]}
      >
        Человек не знает свой вес и доверяет приложению.
      </Flow>

      <Flow
        id="bench-woman"
        title="Жим лёжа: девушка-новичок"
        steps={[
          {
            caption: "Только гриф 20 кг",
            note: "Безопасный вес — 10, гриф тяжелее. Строка про страховку, выбор за ней.",
            screen: (
              <StartScreen
                id="bench_press"
                given={GYM_KNOWN}
                lightest="20 кг"
                warning={SPOTTER}
              />
            ),
            action: "Заменить упражнение",
          },
          {
            caption: "Замена",
            screen: <ReplaceScreen id="bench_press" />,
          },
          {
            caption: "Есть гриф 10 кг",
            note: "Безопасный вес собирается — строки нет.",
            screen: (
              <StartScreen
                id="bench_press"
                given="Грифы 10 и 20 кг · блины 1,25–25"
                lightest="10 кг"
              />
            ),
          },
        ]}
      >
        Экран тот же, что у мужчины. Разница — одна строка, когда гриф тяжелее
        безопасного веса.
      </Flow>

      <Flow
        id="bench-own"
        title="Жим лёжа: знаю свой вес"
        steps={[
          {
            caption: "Старт",
            screen: (
              <StartScreen
                id="bench_press"
                given={GYM_KNOWN}
                lightest="20 кг"
              />
            ),
            action: "Знаю свой вес",
          },
          {
            caption: "Шторка веса",
            note: "Похожие — лучший подход прошлой тренировки, как на экране подхода.",
            screen: (
              <StartScreen
                id="bench_press"
                given={GYM_KNOWN}
                lightest="20 кг"
              />
            ),
            overlay: (
              <OwnWeightSheet
                id="bench_press"
                weightKg={60}
                note="Сначала разминка: 30 и 50 кг"
                facts={[
                  { name: "Жим гантелей лёжа", best: "по 30 кг × 10" },
                  { name: "Жим лёжа в Смите", best: "70 кг × 8" },
                ]}
              />
            ),
            action: "Начать",
          },
          {
            caption: "Разминка",
            screen: (
              <SetScreen
                id="bench_press"
                line="Разминка 1 из 2"
                tone="warm"
                weight="30"
                reps={8}
                target="8"
              />
            ),
          },
        ]}
      >
        Путь опытного: шторка с весом и сразу разминка.
      </Flow>

      <Flow
        id="dumbbells"
        title="Гантели"
        steps={[
          {
            caption: "Мужчина",
            note: "Безопасный вес — по 8, а не самые лёгкие 2.",
            screen: (
              <StartScreen
                id="dumbbell_bench_press"
                given="Гантели 2–30 кг, шаг 2"
                lightest="по 8 кг"
              />
            ),
          },
          {
            caption: "Девушка",
            note: "Безопасный вес — по 3, шаг 2: округлено вниз до 2.",
            screen: (
              <StartScreen
                id="dumbbell_bench_press"
                given="Гантели 2–30 кг, шаг 2"
                lightest="по 2 кг"
              />
            ),
          },
        ]}
      >
        У гантелей минимум зала далеко ниже разумного веса, поэтому старт —
        безопасный вес из таблицы.
      </Flow>

      <Flow
        id="pull-up"
        title="Подтягивания"
        steps={[
          {
            caption: "Старт",
            note: "Легче своего веса не бывает — «+0 кг», как везде в приложении.",
            screen: <StartScreen id="pull_up_wide" lightest="+0 кг" />,
            action: "Заменить упражнение",
          },
          {
            caption: "Замена",
            note: "Тяга блока и гравитрон — уже в каталоге.",
            screen: <ReplaceScreen id="pull_up_wide" />,
          },
        ]}
      >
        Если человек не подтягивается нужное число раз, он выберет замену сам.
      </Flow>

      <Flow
        id="assisted"
        title="Гравитрон"
        steps={[
          {
            caption: "1. Плитки",
            screen: (
              <InventoryScreen
                id="assisted_pull_up_wide"
                title="Какие плитки в гравитроне?"
                text={`${STACK_TEXT} Здесь плитки помогают: чем больше вес, тем легче.`}
                rows={[
                  {
                    ...TOP_PLATE,
                    options: [2.5, 5, 7.5, 10, 15],
                    selected: [5],
                  },
                  { ...STEP, options: [2.5, 5, 10], selected: [5] },
                  {
                    label: "Нижняя плитка",
                    hint: "Число на самой нижней плитке.",
                    options: [40, 50, 60, 70, 80],
                    selected: [60],
                  },
                ]}
              />
            ),
            action: "Дальше",
          },
          {
            caption: "2. Старт",
            note: "Лёгкий вес — самая большая помощь.",
            screen: (
              <StartScreen id="assisted_pull_up_wide" lightest="−60 кг" />
            ),
            action: "С лёгкого веса",
          },
          {
            caption: "3. Подход",
            screen: (
              <SetScreen
                id="assisted_pull_up_wide"
                line="Подбор веса · подход 1 из 3"
                tone="pick"
                weight="−60"
                reps={10}
                target="8 – 12"
              />
            ),
            action: "Сделал",
          },
          {
            caption: "4. Отдых",
            note: "Подбор считает полный вес: 80 − 60 = 20, вдвое — 40, помощь 40.",
            screen: (
              <RestScreen
                selected="Мало"
                main="−40 кг × 10"
                sub="Подбор веса · подход 2 из 3"
                note="Было мало — помощь меньше"
              />
            ),
          },
        ]}
      >
        Подбор работает на полном весе, поэтому инверсия выходит сама.
      </Flow>

      <Flow
        id="squat"
        title="Присед со штангой"
        steps={[
          {
            caption: "Мужчина",
            note: "Безопасный вес 25 — гриф и по 2,5. Строки нет.",
            screen: (
              <StartScreen id="back_squat" given={GYM_KNOWN} lightest="25 кг" />
            ),
          },
          {
            caption: "Девушка",
            note: "Безопасный вес 12,5 — легче грифа.",
            screen: (
              <StartScreen
                id="back_squat"
                given={GYM_KNOWN}
                lightest="20 кг"
                warning={SPOTTER}
              />
            ),
          },
        ]}
      >
        То же правило, что в жиме.
      </Flow>

      <Flow
        id="preacher"
        title="Скотт в тренажёре"
        steps={[
          {
            caption: "1. Плитки",
            screen: (
              <InventoryScreen
                id="preacher_curl_machine"
                title="Какие плитки в тренажёре?"
                text={STACK_TEXT}
                rows={[
                  {
                    ...TOP_PLATE,
                    options: [2.5, 5, 7.5, 10, 15, 20],
                    selected: [10],
                  },
                  { ...STEP, options: [2.5, 5, 10, 15, 20], selected: [5] },
                ]}
              />
            ),
            action: "Дальше",
          },
          {
            caption: "2. Старт",
            note: "Тренажёр: лёгкий вес — верхняя плитка, таблица не нужна.",
            screen: <StartScreen id="preacher_curl_machine" lightest="10 кг" />,
            action: "С лёгкого веса",
          },
          {
            caption: "3. Подход",
            note: "Если даже верхняя плитка не идёт — замена на странице упражнения, по тапу на название.",
            screen: (
              <SetScreen
                id="preacher_curl_machine"
                line="Подбор веса · подход 1 из 3"
                tone="pick"
                weight="10"
                reps={10}
                target="10 – 12"
              />
            ),
          },
        ]}
      >
        Тренажёр безопасен сам, поэтому начинаем с того, что на нём написано.
      </Flow>
    </div>
  );
}
