import s from "./screens.module.scss";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { MdArrowBack, MdChevronRight } from "react-icons/md";
import { EXERCISES } from "../../db/exercises/constants.ts";
import { ExerciseAnimation } from "../WorkoutFocus/components/ExerciseAnimation";

const exercise = (id: string) => {
  const found = EXERCISES[id];
  if (!found) throw new Error(`No exercise ${id}`);
  return found;
};

// The replacements worth offering are the ones without the same conflict:
// a free barbell starts at the empty bar again, everything else starts light.
const safeAlternatives = (id: string) =>
  exercise(id).alternatives.filter(({ id: alternative }) => {
    const { load, equipment } = exercise(alternative);
    return load.type !== "barbell" || equipment.includes("smith");
  });

function Chrome({ children }: { children: ReactNode }) {
  return (
    <>
      <div className={s.top}>
        <span className={s.back}>
          <MdArrowBack />
        </span>
        <span className={s.clock}>0:04</span>
      </div>
      <div className={s.progress}>
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} className={clsx(i === 0 && s.currentSet)} />
        ))}
      </div>
      {children}
    </>
  );
}

function Header({ id, title }: { id: string; title: string }) {
  return (
    <div className={s.header}>
      <div className={s.name}>{exercise(id).name}</div>
      <div className={s.title}>{title}</div>
    </div>
  );
}

function Alternatives({ id }: { id: string }) {
  return (
    <div className={s.options}>
      {safeAlternatives(id).map((alternative) => (
        <div key={alternative.id} className={s.option}>
          <div className={s.optionBody}>
            <div className={s.optionTitle}>{exercise(alternative.id).name}</div>
            <div className={s.optionNote}>{alternative.benefits}</div>
          </div>
          <MdChevronRight className={s.chevron} />
        </div>
      ))}
    </div>
  );
}

export interface ChipRow {
  label: string;
  hint?: string;
  options: number[];
  selected: number[];
}

export function InventoryScreen({
  id,
  title,
  text,
  rows,
}: {
  id: string;
  title: string;
  text: string;
  rows: ChipRow[];
}) {
  return (
    <Chrome>
      <Header id={id} title={title} />
      <div className={s.scroll}>
        <div className={s.text}>{text}</div>
        {rows.map((row) => (
          <div key={row.label} className={s.row}>
            <div className={s.label}>{row.label}</div>
            {row.hint && <div className={s.hint}>{row.hint}</div>}
            <div className={s.chips}>
              {row.options.map((option) => (
                <span
                  key={option}
                  className={clsx(
                    s.chip,
                    row.selected.includes(option) && s.selected,
                  )}
                >
                  {option.toString().replace(".", ",")}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={s.action}>
        <span className={s.next}>Дальше</span>
      </div>
    </Chrome>
  );
}

// The warning says what the problem is and offers the way out at once.
export function WarningListScreen({
  id,
  minimum,
}: {
  id: string;
  minimum: string;
}) {
  return (
    <Chrome>
      <Header id={id} title="Может быть тяжело" />
      <div className={s.scroll}>
        <div className={s.text}>
          Меньше {minimum} здесь не поставить. Если ты только начинаешь, лучше
          начать с другого упражнения:
        </div>
        <Alternatives id={id} />
      </div>
      <div className={s.action}>
        <span className={s.skip}>Оставить это упражнение</span>
      </div>
    </Chrome>
  );
}

// The warning as one question; the list comes after «Заменить».
export function WarningQuestionScreen({
  id,
  minimum,
}: {
  id: string;
  minimum: string;
}) {
  return (
    <Chrome>
      <Header id={id} title="Заменить упражнение?" />
      <div className={s.scroll}>
        <div className={s.text}>
          Меньше {minimum} здесь не поставить. Если ты только начинаешь, это
          может быть тяжело.
        </div>
      </div>
      <div className={s.action}>
        <span className={s.next}>Заменить</span>
        <span className={clsx(s.skip, s.secondary)}>Оставить</span>
      </div>
    </Chrome>
  );
}

export function ReplaceScreen({ id }: { id: string }) {
  return (
    <Chrome>
      <Header id={id} title="Чем заменить?" />
      <div className={s.scroll}>
        <Alternatives id={id} />
      </div>
    </Chrome>
  );
}

// The set screen the app already has, on the start weight.
export function SetScreen({
  id,
  weight,
  reps,
  target,
}: {
  id: string;
  weight: string;
  reps: number;
  target: string;
}) {
  const { asset, name } = exercise(id);
  return (
    <Chrome>
      <div className={s.stage}>
        {asset?.type === "cross-fade" && (
          <ExerciseAnimation startUrl={asset.startUrl} endUrl={asset.endUrl} />
        )}
        <div className={s.setName}>{name}</div>
        <div className={clsx(s.setLine, s.pick)}>
          Подбор веса · подход 1 из 3
        </div>
        <div className={s.numbers}>
          <div className={s.cell}>
            <div className={s.big}>
              {weight}
              <span className={s.units}>кг</span>
            </div>
            <div className={s.under} />
          </div>
          <div className={s.times}>×</div>
          <div className={s.cell}>
            <div className={s.big}>
              {reps}
              <span className={s.units}>раз</span>
            </div>
            <div className={s.under}>цель {target}</div>
          </div>
        </div>
      </div>
      <div className={s.action}>
        <span className={s.done}>Сделал</span>
      </div>
    </Chrome>
  );
}
