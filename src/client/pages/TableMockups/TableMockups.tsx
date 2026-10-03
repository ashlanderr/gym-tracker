import s from "./styles.module.scss";
import type { ReactNode } from "react";
import { MdChevronRight, MdOutlineHelpOutline } from "react-icons/md";
import { MuscleFigure } from "../../components";
import { EXERCISES } from "../../db/exercises/constants.ts";
import { MockExercise, type MockSet } from "./components";

const THUMB_EXERCISES = [
  "bench_press",
  "back_squat",
  "pull_up_wide",
  "barbell_curl",
  "preacher_dumbbell_curl",
  "chest_supported_row_plates",
];

interface ThumbVariant {
  title: string;
  text: string;
  className?: string;
  isMuscles?: boolean;
}

const THUMB_VARIANTS: ThumbVariant[] = [
  { title: "Как сейчас", text: "Кадр целиком, светлые линии на чёрном." },
  {
    title: "Инверсия",
    text: "Тёмные линии на светлой плитке.",
    className: s.invert,
  },
  {
    title: "Крупнее",
    text: "Кадр увеличен в 1.6 раза, поля обрезаны.",
    className: s.zoom,
  },
  {
    title: "Инверсия и крупнее",
    text: "Оба приёма вместе.",
    className: s.invertZoom,
  },
  {
    title: "Только мышцы",
    text: "Вместо кадра всегда фигура с мышцами.",
    isMuscles: true,
  },
];

const KNOWN: MockSet[] = [
  { number: "1", prev: "60 x 8", weight: "60", reps: "8", done: true },
  { number: "2", prev: "60 x 8", weight: "60", reps: "8", done: true },
  { number: "3", prev: "60 x 8", weight: "60", reps: "6 - 8" },
];

const UNKNOWN: MockSet[] = [
  { number: "1", prev: "-", weight: "-", reps: "10 - 15" },
  { number: "2", prev: "-", weight: "-", reps: "10 - 15" },
  { number: "3", prev: "-", weight: "-", reps: "10 - 15" },
];

// Variants of the workout table to compare side by side. Reachable only by
// typing the address while developing.
export function TableMockups() {
  return (
    <div className={s.root}>
      <h1 className={s.heading}>Картинка упражнения</h1>
      <p className={s.lead}>
        Четыре упражнения с кадрами и два без: заглушка с мышцами спереди и
        сзади. Два названия длинные.
      </p>
      <div className={s.variants}>
        {THUMB_VARIANTS.map((variant) => (
          <Variant
            key={variant.title}
            title={variant.title}
            text={variant.text}
          >
            {THUMB_EXERCISES.map((id) => (
              <MockExercise
                key={id}
                id={id}
                sets={[]}
                isCompact
                thumbClassName={variant.className}
                thumb={variant.isMuscles ? <MuscleTile id={id} /> : undefined}
              />
            ))}
          </Variant>
        ))}
      </div>

      <h1 className={s.heading}>Инвентарь</h1>
      <p className={s.lead}>
        Жим лёжа уже со штангой. У «бабочки» неизвестен стек, у тяги гантели —
        гантели зала.
      </p>
      <div className={s.variants}>
        <Variant
          title="Между упражнениями"
          text="Отдельная карточка перед упражнением."
        >
          <MockExercise id="bench_press" sets={KNOWN} />
          <Between text="Какие веса на стеке «бабочки»?" />
          <MockExercise id="pec_deck" sets={UNKNOWN} />
          <Between text="Какие гантели есть в зале?" />
          <MockExercise id="dumbbell_row" sets={UNKNOWN} />
        </Variant>

        <Variant
          title="Внутри упражнения"
          text="Строка под названием, вес пустой."
        >
          <MockExercise id="bench_press" sets={KNOWN} />
          <MockExercise
            id="pec_deck"
            sets={UNKNOWN}
            notice={<Inside text="Укажи веса на стеке" />}
          />
          <MockExercise
            id="dumbbell_row"
            sets={UNKNOWN}
            notice={<Inside text="Укажи гантели в зале" />}
          />
        </Variant>

        <Variant
          title="Знак вопроса"
          text="Вместо веса «?», нажатие открывает инвентарь."
        >
          <MockExercise id="bench_press" sets={KNOWN} />
          <MockExercise
            id="pec_deck"
            sets={UNKNOWN}
            weightCell={<Question />}
          />
          <MockExercise
            id="dumbbell_row"
            sets={UNKNOWN}
            weightCell={<Question />}
          />
        </Variant>

        <Variant
          title="Внутри и знак вопроса"
          text="Строка объясняет, «?» показывает, где не хватает."
        >
          <MockExercise id="bench_press" sets={KNOWN} />
          <MockExercise
            id="pec_deck"
            sets={UNKNOWN}
            notice={<Inside text="Укажи веса на стеке" />}
            weightCell={<Question />}
          />
          <MockExercise
            id="dumbbell_row"
            sets={UNKNOWN}
            notice={<Inside text="Укажи гантели в зале" />}
            weightCell={<Question />}
          />
        </Variant>
      </div>
    </div>
  );
}

function Variant({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <section className={s.variant}>
      <div className={s.variantTitle}>{title}</div>
      <div className={s.variantText}>{text}</div>
      <div className={s.screen}>{children}</div>
    </section>
  );
}

function MuscleTile({ id }: { id: string }) {
  return (
    <div className={s.muscleTile}>
      <MuscleFigure muscles={EXERCISES[id].primaryMuscles} />
    </div>
  );
}

function Between({ text }: { text: string }) {
  return (
    <div className={s.between}>
      <div className={s.betweenText}>{text}</div>
      <div className={s.betweenNote}>Без этого не подобрать вес</div>
      <span className={s.betweenButton}>Указать</span>
    </div>
  );
}

function Inside({ text }: { text: string }) {
  return (
    <div className={s.inside}>
      <MdOutlineHelpOutline />
      <span className={s.insideText}>{text}</span>
      <MdChevronRight />
    </div>
  );
}

function Question() {
  return <span className={s.question}>?</span>;
}
