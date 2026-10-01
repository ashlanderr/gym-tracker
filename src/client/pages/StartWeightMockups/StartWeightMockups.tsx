import s from "./styles.module.scss";
import { Fragment, type ReactNode } from "react";
import { MdArrowForward } from "react-icons/md";
import { Phone } from "./components";
import {
  OwnWeightSheet,
  ReplaceScreen,
  RestScreen,
  SetScreen,
  StartScreen,
  WeightPage,
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
  ["a-novice", "А: новичок"],
  ["a-blocked", "А: гриф тяжелее безопасного"],
  ["a-own", "А: знаю рабочий вес"],
  ["a-dumbbells", "А: гантели"],
  ["b-cases", "Б: сразу вес"],
];

const GYM_KNOWN = "Гриф 20 кг · блины 1,25–25";

const BAR_TOO_HEAVY = "Пустой гриф тяжелее, чем безопасно начинать новичку";

const BENCH_FACTS = [
  { name: "Жим гантелей лёжа", best: "по 30 кг × 10" },
  { name: "Жим лёжа в Смите", best: "70 кг × 8" },
];

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

        <h3>Вариант А — три кнопки</h3>
        <p>
          «С лёгкого веса», «Знаю рабочий вес», «Заменить упражнение». Если
          минимум снаряда тяжелее безопасного веса, первая кнопка выключается
          (А1) или пропадает с объяснением над остальными (А2). По умолчанию
          тогда становится замена: для новичка это единственный безопасный путь,
          а опытный и так нажмёт «Знаю рабочий вес».
        </p>

        <h3>Вариант Б — сразу вес</h3>
        <p>
          Выбора старта нет. На экране число, одна строка о том, откуда оно, и
          «Начать». Открывается на безопасном весе; изменил число — это рабочий
          вес, и строка говорит про разминку. Всё остальное — потом.
        </p>

        <nav className={s.toc}>
          {FLOWS.map(([id, title]) => (
            <button key={id} onClick={() => jump(id)}>
              {title}
            </button>
          ))}
        </nav>
      </header>

      <Flow
        id="a-novice"
        title="А: жим лёжа, новичок"
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
            action: "С лёгкого веса",
          },
          {
            caption: "Подход",
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
            caption: "Отдых",
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
        Обычный случай: безопасный вес мужчины в жиме — ровно гриф.
      </Flow>

      <Flow
        id="a-blocked"
        title="А: девушка, только гриф 20 кг"
        steps={[
          {
            caption: "А1. Кнопка выключена",
            note: "Видно, чего нельзя и почему. Синей стала замена.",
            screen: (
              <StartScreen
                id="bench_press"
                given={GYM_KNOWN}
                lightest="20 кг"
                blocked={{ mode: "disabled", text: BAR_TOO_HEAVY }}
              />
            ),
          },
          {
            caption: "А2. Кнопки нет",
            note: "Короче, но пропажа кнопки ничего не объясняет без плашки.",
            screen: (
              <StartScreen
                id="bench_press"
                given={GYM_KNOWN}
                lightest="20 кг"
                blocked={{
                  mode: "hidden",
                  text: `${BAR_TOO_HEAVY}. Знаешь свой вес — введи его, если нет — замени упражнение.`,
                }}
              />
            ),
          },
          {
            caption: "А1 в приседе",
            screen: (
              <StartScreen
                id="back_squat"
                given={GYM_KNOWN}
                lightest="20 кг"
                blocked={{ mode: "disabled", text: BAR_TOO_HEAVY }}
              />
            ),
          },
        ]}
      >
        Только у жимов лёжа и приседов: у остальных упражнений из-под штанги
        выбраться можно, и гриф тяжелее безопасного веса не опасен.
      </Flow>

      <Flow
        id="a-own"
        title="А: знаю рабочий вес"
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
            action: "Знаю рабочий вес",
          },
          {
            caption: "Шторка веса",
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
                facts={BENCH_FACTS}
              />
            ),
          },
        ]}
      >
        Два экрана подряд: выбор, потом шторка.
      </Flow>

      <Flow
        id="a-dumbbells"
        title="А: гантели"
        steps={[
          {
            caption: "Без «по»",
            note: "Влезает в строку, но на экране подхода будет «16 кг».",
            screen: (
              <StartScreen
                id="dumbbell_bench_press"
                given="Гантели 2–30 кг, шаг 2"
                lightest="8 кг"
              />
            ),
          },
        ]}
      >
        «Подберём по ощущениям» больше не переносится.
      </Flow>

      <Flow
        id="b-cases"
        title="Б: сразу вес"
        steps={[
          {
            caption: "Мужчина",
            screen: (
              <WeightPage
                id="bench_press"
                value="20"
                line="Лёгкий вес. Дальше подберём по ощущениям"
              />
            ),
          },
          {
            caption: "Изменил на 60",
            screen: (
              <WeightPage
                id="bench_press"
                value="60"
                line="Сначала разминка: 30 и 50 кг"
              />
            ),
          },
          {
            caption: "Девушка, только гриф 20",
            screen: (
              <WeightPage
                id="bench_press"
                value="20"
                line="Пустой гриф тяжелее, чем безопасно начинать новичку. Нужна страховка"
                warning
              />
            ),
          },
          {
            caption: "Гантели",
            screen: (
              <WeightPage
                id="dumbbell_bench_press"
                value="16"
                line="Две гантели по 8 кг"
              />
            ),
          },
          {
            caption: "Гравитрон",
            screen: (
              <WeightPage
                id="assisted_pull_up_wide"
                value="−60"
                line="Самая большая помощь. Дальше подберём по ощущениям"
              />
            ),
          },
        ]}
      >
        Одна строка под числом меняется по случаю, всё остальное одинаково.
      </Flow>

      <section className={s.flow}>
        <h2>Для сравнения: замена</h2>
        <div className={s.row}>
          <Phone caption="Замена" note="Одна и та же в А и Б.">
            <ReplaceScreen id="bench_press" />
          </Phone>
        </div>
      </section>
    </div>
  );
}
