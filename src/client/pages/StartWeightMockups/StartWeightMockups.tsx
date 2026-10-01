import s from "./styles.module.scss";
import { Fragment, type ReactNode } from "react";
import { MdArrowForward } from "react-icons/md";
import { Phone } from "./components";
import {
  InventoryScreen,
  OwnWeightSheet,
  ReplaceScreen,
  RestScreen,
  SafetyScreen,
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
  ["pull-up", "Подтягивания"],
  ["assisted", "Гравитрон"],
  ["squat", "Присед"],
  ["preacher", "Скотт в тренажёре"],
];

const BENCH_SAFETY = {
  title: "Без страховки не начинай",
  text: "Если вес не пойдёт, штанга останется на груди. Попроси кого-нибудь подстраховать или поставь упоры чуть ниже груди.",
};

const GYM_KNOWN = "Гриф 20 кг · блины 1,25–25";

const BARBELL_INVENTORY = {
  title: "Что есть в зале?",
  text: "Блины и грифы общие на весь зал, поэтому их нужно указать всего один раз.",
  rows: [
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
  ],
};

export function StartWeightMockups() {
  return (
    <div className={s.root}>
      <header className={s.intro}>
        <h1>Первый вес упражнения</h1>

        <p>
          Когда у упражнения нет истории, вместо экрана подхода открывается
          настройка: сначала снаряд, если зал ещё не знаем, потом старт.
        </p>

        <h3>Как устроено</h3>
        <ol>
          <li>
            <b>На старте всегда три кнопки</b>, у любого упражнения, в том числе
            созданного самим человеком: «С самого лёгкого», «Знаю свой вес»,
            «Заменить упражнение». От упражнения зависит только число на первой
            кнопке — минимум снаряда.
          </li>
          <li>
            <b>Предупреждение — отдельным экраном</b> после «С самого лёгкого»,
            только у упражнений с текстом страховки в каталоге. У остальных
            кнопка сразу начинает подход.
          </li>
          <li>
            <b>Похожие упражнения из истории</b> показаны в шторке «Знаю свой
            вес» — там, где человек вводит число, а не на старте.
          </li>
          <li>
            <b>Замена — тот же список, что по «Не выходит?»</b>: альтернативы из
            каталога с их «чем лучше».
          </li>
          <li>
            <b>В подборе четыре оценки</b>: «Невесомо», «Легко», «Норм»,
            «Тяжело». «Отказа» нет: с самого лёгкого веса до него не доходит, а
            кнопки помещаются в одну строку.
          </li>
          <li>
            <b>У тренажёров спрашиваем верхнюю плитку</b> — число на ней
            написано. Вес самого тренажёра без плиток не спрашиваем: его не
            знает никто. Он нужен только для расчёта старта, поэтому лежит
            оценкой в каталоге и не попадает ни в записи, ни на экран.
          </li>
        </ol>

        <h3>Что не решено</h3>
        <ul>
          <li>
            <b>Самое лёгкое бывает смешным.</b> Гантели по 2 кг для мужчины,
            первая плитка в жиме ногами. У штанги минимум — гриф, и это
            нормальный старт. У гантелей и многих тренажёров минимум сильно ниже
            любого разумного веса, а с удвоением до рабочего веса уйдёт
            три-четыре подхода. Вариант: первая кнопка показывает типичный вес
            новичка того же пола, но не меньше минимума. Это возвращает столбцы
            новичков из старой таблицы, только как предложение.
          </li>
          <li>
            <b>Красивый выбор грифов и блинов</b> вместо чипов. Отложено.
          </li>
          <li>
            <b>Слово «Невесомо».</b> Другие варианты в одно слово: «Пушинка»,
            «Изи», «Слабо».
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
        id="bench-novice"
        title="Жим лёжа: новичок, зал не настроен"
        steps={[
          {
            caption: "1. Инвентарь",
            note: "Типичное уже отмечено, обычно хватает «Дальше». У второго штангового упражнения этой страницы нет.",
            screen: <InventoryScreen id="bench_press" {...BARBELL_INVENTORY} />,
            action: "Дальше",
          },
          {
            caption: "2. Старт",
            screen: <StartScreen id="bench_press" lightest="20 кг" />,
            action: "С самого лёгкого",
          },
          {
            caption: "3. Страховка",
            note: "Только у упражнений, из-под которых не выбраться.",
            screen: <SafetyScreen id="bench_press" {...BENCH_SAFETY} />,
            action: "Начинаю",
          },
          {
            caption: "4. Подход",
            note: "Синяя строка — вес ещё подбирается.",
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
            caption: "5. Отдых",
            note: "Четыре оценки в одну строку. Новый вес подписан.",
            screen: (
              <RestScreen
                selected="Невесомо"
                main="40 кг × 8"
                sub="Подбор веса · подход 2 из 3"
                note="Было невесомо — вес вдвое"
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
            screen: (
              <StartScreen
                id="bench_press"
                given={GYM_KNOWN}
                lightest="20 кг"
              />
            ),
            action: "Заменить упражнение",
          },
          {
            caption: "Замена",
            note: "Альтернативы и «чем лучше» — прямо из каталога.",
            screen: <ReplaceScreen id="bench_press" line="Новое упражнение" />,
          },
          {
            caption: "Есть гриф 10 кг",
            note: "Самое лёгкое — самый лёгкий гриф зала.",
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
        Без строки «новичкам обычно…» экран у неё такой же, как у мужчины.
        Защищает её экран страховки, а если гриф ей не по силам — «Заменить
        упражнение». Сам выбор замены остаётся за ней.
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
            note: "Похожие упражнения — здесь, где вводится число. Вес, повторы и давность разнесены.",
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
                  {
                    name: "Жим гантелей лёжа",
                    weight: "2 × 30 кг",
                    reps: "10 раз",
                    when: "4 дня назад",
                  },
                  {
                    name: "Жим лёжа в Смите",
                    weight: "70 кг",
                    reps: "8 раз",
                    when: "2 недели назад",
                  },
                ]}
              />
            ),
            action: "Начать",
          },
          {
            caption: "Разминка",
            note: "Страховки после «Знаю свой вес» не спрашиваем: это опытный путь.",
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
        id="pull-up"
        title="Подтягивания"
        steps={[
          {
            caption: "Старт",
            note: "Те же три кнопки. Самое лёгкое — без отягощения, «+0 кг», как везде в приложении.",
            screen: <StartScreen id="pull_up_wide" lightest="+0 кг" />,
            action: "Заменить упражнение",
          },
          {
            caption: "Замена",
            note: "Гравитрон и тяга блока — уже в каталоге.",
            screen: <ReplaceScreen id="pull_up_wide" line="Новое упражнение" />,
          },
        ]}
      >
        Если человек не подтягивается нужное число раз, он сам выберет замену.
        Отдельного вопроса про повторы нет.
      </Flow>

      <Flow
        id="assisted"
        title="Гравитрон"
        steps={[
          {
            caption: "1. Плитки",
            note: "Числа написаны на плитках, их видно.",
            screen: (
              <InventoryScreen
                id="assisted_pull_up_wide"
                title="Какие плитки в гравитроне?"
                text="У каждого тренажёра свои плитки, поэтому их нужно указать для него отдельно. Здесь плитки помогают: чем больше вес, тем легче."
                rows={[
                  {
                    label: "Верхняя плитка",
                    hint: "Число на самой верхней плитке.",
                    options: [2.5, 5, 7.5, 10, 15],
                    selected: [5],
                  },
                  {
                    label: "Шаг",
                    hint: "На сколько отличаются соседние плитки.",
                    options: [2.5, 5, 10],
                    selected: [5],
                  },
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
            note: "Самое лёгкое здесь — самая большая помощь. Записано как в приложении сейчас, с минусом.",
            screen: (
              <StartScreen id="assisted_pull_up_wide" lightest="−60 кг" />
            ),
            action: "С самого лёгкого",
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
            note: "Подбор считает полный вес: 80 − 60 = 20, вдвое — 40, значит помощь 40.",
            screen: (
              <RestScreen
                selected="Невесомо"
                main="−40 кг × 10"
                sub="Подбор веса · подход 2 из 3"
                note="Было невесомо — помощь меньше"
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
            caption: "Старт",
            note: "Инвентарь известен по жиму — только строка.",
            screen: (
              <StartScreen id="back_squat" given={GYM_KNOWN} lightest="20 кг" />
            ),
            action: "С самого лёгкого",
          },
          {
            caption: "Страховка",
            screen: (
              <SafetyScreen
                id="back_squat"
                title="Выставь страховочные упоры"
                text="Поставь упоры рамы чуть ниже нижней точки приседа: если не встанешь, опустишь штангу на них. Нет рамы с упорами — лучше замени упражнение."
              />
            ),
          },
        ]}
      >
        Тот же экран страховки, текст свой.
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
                text="У каждого тренажёра свои плитки, поэтому их нужно указать для него отдельно."
                rows={[
                  {
                    label: "Верхняя плитка",
                    hint: "Число на самой верхней плитке.",
                    options: [2.5, 5, 7.5, 10, 15, 20],
                    selected: [10],
                  },
                  {
                    label: "Шаг",
                    hint: "На сколько отличаются соседние плитки.",
                    options: [2.5, 5, 10, 15, 20],
                    selected: [5],
                  },
                ]}
              />
            ),
            action: "Дальше",
          },
          {
            caption: "2. Старт",
            screen: <StartScreen id="preacher_curl_machine" lightest="10 кг" />,
            action: "С самого лёгкого",
          },
          {
            caption: "3. Подход",
            note: "«Не выходит?» есть на каждом подходе любого упражнения.",
            screen: (
              <SetScreen
                id="preacher_curl_machine"
                line="Подбор веса · подход 1 из 3"
                tone="pick"
                weight="10"
                reps={10}
                target="10 – 12"
                trouble
              />
            ),
            action: "Не выходит?",
          },
          {
            caption: "4. Замена",
            note: "Тот же список, плюс «Закончить упражнение».",
            screen: (
              <ReplaceScreen
                id="preacher_curl_machine"
                line="Подбор веса · подход 1 из 3"
                stop
              />
            ),
          },
        ]}
      >
        Если даже верхняя плитка не идёт, человек это увидит на первом подходе и
        заменит упражнение.
      </Flow>
    </div>
  );
}
