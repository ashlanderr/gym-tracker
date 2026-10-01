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
          Выбора старта нет: число, строки под ним, «Начать» и «Заменить
          упражнение». Открывается на стартовом весе: безопасном у штанги и
          гантелей, минимуме снаряда у тренажёров. Страница появляется только
          там, где вес можно выбрать: у подтягиваний без отягощения её нет,
          сразу подход.
        </p>
        <p>
          Под числом до трёх строк, каждая со своим правилом, всегда в этом
          порядке:
        </p>
        <table className={s.rules}>
          <thead>
            <tr>
              <th>Строка</th>
              <th>Когда</th>
              <th>Текст</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan={3}>Что за число</td>
              <td>две гантели</td>
              <td>По 8 кг в каждой руке</td>
            </tr>
            <tr>
              <td>
                <code>weight: negative</code>
              </td>
              <td>Помощь тренажёра</td>
            </tr>
            <tr>
              <td>
                <code>weight: positive</code> с отягощением
              </td>
              <td>Вес на поясе</td>
            </tr>
            <tr>
              <td rowSpan={2}>Что дальше</td>
              <td>число равно стартовому</td>
              <td>Дальше подберём вес по ощущениям</td>
            </tr>
            <tr>
              <td>число другое и разминка не пустая</td>
              <td>Разминка: 30 и 50 кг</td>
            </tr>
            <tr>
              <td>Страховка</td>
              <td>
                <code>spotter</code> и число выше безопасного веса для пола —
                при любом весе выше, не только на минимуме
              </td>
              <td className={s.warn}>Нужен страхующий или упоры</td>
            </tr>
          </tbody>
        </table>
        <p>
          <b>Не решено:</b> подбор у отягощения на поясе. Удвоение полного веса
          с «+0» даёт «+80 кг», удвоение отягощения даёт снова ноль.
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
            caption: "Мужчина, старт",
            screen: (
              <WeightPage
                id="bench_press"
                value="20"
                next="Дальше подберём вес по ощущениям"
              />
            ),
          },
          {
            caption: "Мужчина поднял до 60",
            screen: (
              <WeightPage
                id="bench_press"
                value="60"
                next="Разминка: 30 и 50 кг"
                warning="Нужен страхующий или упоры"
              />
            ),
          },
          {
            caption: "Девушка, только гриф 20",
            screen: (
              <WeightPage
                id="bench_press"
                value="20"
                next="Дальше подберём вес по ощущениям"
                warning="Нужен страхующий или упоры"
              />
            ),
          },
          {
            caption: "Девушка подняла до 30",
            screen: (
              <WeightPage
                id="bench_press"
                value="30"
                next="Разминка: 25 кг"
                warning="Нужен страхующий или упоры"
              />
            ),
          },
          {
            caption: "Гантели, старт",
            screen: (
              <WeightPage
                id="dumbbell_bench_press"
                value="16"
                meaning="По 8 кг в каждой руке"
                next="Дальше подберём вес по ощущениям"
              />
            ),
          },
          {
            caption: "Гравитрон, сменил на −40",
            screen: (
              <WeightPage
                id="assisted_pull_up_wide"
                value="−40"
                meaning="Помощь тренажёра"
                next="Разминка: −60 и −50 кг"
              />
            ),
          },
          {
            caption: "Тренажёр, старт",
            screen: (
              <WeightPage
                id="preacher_curl_machine"
                value="10"
                next="Дальше подберём вес по ощущениям"
              />
            ),
          },
        ]}
      >
        Те же правила на разных людях, снарядах и весах.
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
