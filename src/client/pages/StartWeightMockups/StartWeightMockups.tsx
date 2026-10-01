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
  WeightPage,
  type WeightLayout,
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
  ["b-layouts", "Б: компоновки"],
  ["b-cases", "Б: случаи"],
  ["b-flow", "Б: от инвентаря до подхода"],
];

const GYM_KNOWN = "Гриф 20 кг · блины 1,25–25";

const BAR_TOO_HEAVY = "Пустой гриф тяжелее, чем безопасно начинать новичку";

const B_WARNING =
  "Пустой гриф тяжелее, чем безопасно начинать новичку. Без страховки или упоров не начинай — или замени упражнение.";

const PICK = "Начнём с лёгкого, дальше подберём вес по ощущениям";

const BENCH_FACTS = [
  { name: "Жим гантелей лёжа", best: "по 30 кг × 10" },
  { name: "Жим лёжа в Смите", best: "70 кг × 8" },
];

const LAYOUTS: Array<[WeightLayout, string, string]> = [
  [
    "picture",
    "С картинкой",
    "Картинка помогает понять, о каком упражнении речь, но съедает высоту: заметки уходят под скролл.",
  ],
  [
    "compact",
    "Без картинки",
    "Число и блины сверху, заметки под ними. Всё помещается без скролла.",
  ],
  [
    "thumb",
    "Число у большого пальца",
    "Заметки сверху, число и −/+ внизу, рядом с «Начать». Удобно одной рукой, но первым читается текст, а не вес.",
  ],
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
          Выбора старта нет. Шторка веса становится страницей и открывается на
          безопасном весе. Если человек его не трогает, это старт с лёгкого
          веса; если меняет — это его рабочий вес. Отдельный режим не нужен:
          подбор и так идёт, пока ни один подход не оценён «норм» или «тяжело»,
          а разминка считается от выбранного числа и от лёгкого веса выпадает
          сама. Всё остальное — строки вокруг числа: предупреждение, разминка,
          похожие упражнения, инвентарь, замена.
        </p>

        <h3>Оценка</h3>
        <ul>
          <li>
            <b>Б лучше.</b> Один экран вместо двух, ни одного вопроса, а
            «правильный» вариант всегда есть — это число по умолчанию. Опытный
            меняет число вместо поиска кнопки «Знаю рабочий вес». Предупреждение
            не запрещает и не прячет кнопку, а стоит рядом с числом, к которому
            относится.
          </li>
          <li>
            <b>У А нет хорошего значения по умолчанию</b>, когда первая кнопка
            выключена: замена подходит новичку, ввод веса — опытному. Синяя
            замена толкает опытного не туда.
          </li>
          <li>
            <b>Компоновка Б — без картинки.</b> Картинка уже есть на экране
            подхода сразу после, а здесь она выталкивает заметки под скролл.
            Число у большого пальца удобнее, но страница про вес должна
            начинаться с веса.
          </li>
          <li>
            <b>Скролл допустим, но только для второстепенного.</b> Число, строка
            под ним и «Начать» видны всегда. Высокий стек тренажёра уводит под
            скролл строку инвентаря — это нормально, она нужна редко. Синяя
            строка про подбор поэтому стоит сразу под числом, а не после
            рисунка.
          </li>
          <li>
            <b>Гантели.</b> Приложение хранит вес пары: жим гантелей по 8 кг на
            экране подхода — «16 кг». На кнопке А «8 кг» с этим расходится. В Б
            число то же, что на экране подхода, а под ним — «две гантели по 8
            кг» и рисунок.
          </li>
        </ul>

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
        id="b-layouts"
        title="Б: три компоновки"
        steps={LAYOUTS.flatMap(([layout, caption, note]) => [
          {
            caption: `${caption}: мужчина`,
            note,
            screen: (
              <WeightPage
                id="bench_press"
                pick={PICK}
                layout={layout}
                weightKg={20}
                value="20"
                given={GYM_KNOWN}
                facts={BENCH_FACTS}
              />
            ),
          },
          {
            caption: `${caption}: девушка, гриф 20`,
            screen: (
              <WeightPage
                id="bench_press"
                pick={PICK}
                layout={layout}
                weightKg={20}
                value="20"
                given={GYM_KNOWN}
                warning={B_WARNING}
              />
            ),
          },
        ])}
      >
        Один и тот же экран в трёх раскладках — у мужчины с историей похожих
        упражнений и у девушки с предупреждением.
      </Flow>

      <Flow
        id="b-cases"
        title="Б: разные снаряды"
        steps={[
          {
            caption: "Знаю вес: поменял на 60",
            note: "Появилась разминка. Отдельной кнопки не было — человек просто нажал +.",
            screen: (
              <WeightPage
                id="bench_press"
                layout="compact"
                weightKg={60}
                value="60"
                given={GYM_KNOWN}
                warmup="Сначала разминка: 30 и 50 кг"
                facts={BENCH_FACTS}
              />
            ),
          },
          {
            caption: "Гантели",
            note: "Число как на экране подхода, расшифровка под ним.",
            screen: (
              <WeightPage
                id="dumbbell_bench_press"
                pick={PICK}
                layout="compact"
                weightKg={16}
                value="16"
                under="две гантели по 8 кг"
                given="Гантели 2–30 кг, шаг 2"
              />
            ),
          },
          {
            caption: "Подтягивания",
            note: "Рисовать нечего — только число.",
            screen: (
              <WeightPage
                id="pull_up_wide"
                pick={PICK}
                layout="compact"
                weightKg={0}
                value="+0"
                under="без отягощения"
              />
            ),
          },
          {
            caption: "Гравитрон",
            note: "Стек рисует настоящий визуализатор.",
            screen: (
              <WeightPage
                id="assisted_pull_up_wide"
                pick={PICK}
                layout="compact"
                weightKg={60}
                value="−60"
                under="помощь: чем больше, тем легче"
                given="Плитки 5–60, шаг 5"
              />
            ),
          },
          {
            caption: "Тренажёр",
            screen: (
              <WeightPage
                id="preacher_curl_machine"
                pick={PICK}
                layout="compact"
                weightKg={10}
                value="10"
                given="Плитки от 10, шаг 5"
              />
            ),
          },
        ]}
      >
        Компоновка без картинки на всех типах снарядов.
      </Flow>

      <Flow
        id="b-flow"
        title="Б: от инвентаря до подхода"
        steps={[
          {
            caption: "1. Инвентарь",
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
            caption: "2. Вес",
            screen: (
              <WeightPage
                id="bench_press"
                pick={PICK}
                layout="compact"
                weightKg={20}
                value="20"
                given={GYM_KNOWN}
              />
            ),
            action: "Начать",
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
          },
        ]}
      >
        Новичок: «Дальше», «Начать» — и он на подходе.
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
