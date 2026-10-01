import s from "./screens.module.scss";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
  MdArrowBack,
  MdChevronRight,
  MdOutlineShield,
  MdSwapHoriz,
} from "react-icons/md";
import { defaultGym } from "../../db";
import { EXERCISES } from "../../db/exercises/constants.ts";
import { ExerciseAnimation } from "../WorkoutFocus/components/ExerciseAnimation";
import { WeightsVisualizer } from "../Workout/components";

const exercise = (id: string) => {
  const found = EXERCISES[id];
  if (!found) throw new Error(`No exercise ${id}`);
  return found;
};

function Chrome({
  sets = 9,
  current = 0,
  children,
}: {
  sets?: number;
  current?: number;
  children: ReactNode;
}) {
  return (
    <>
      <div className={s.top}>
        <span className={s.back}>
          <MdArrowBack />
        </span>
        <span className={s.clock}>0:04</span>
      </div>
      <div className={s.progress}>
        {Array.from({ length: sets }, (_, i) => (
          <i
            key={i}
            className={clsx(
              i < current && s.doneSet,
              i === current && s.currentSet,
            )}
          />
        ))}
      </div>
      {children}
    </>
  );
}

function Header({ id, line }: { id: string; line: string }) {
  return (
    <div className={s.header}>
      <div className={s.name}>{exercise(id).name}</div>
      <div className={s.line}>{line}</div>
    </div>
  );
}

// Setup

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
      <Header id={id} line="Новое упражнение" />
      <div className={s.scroll}>
        <div className={s.title}>{title}</div>
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

// The same three buttons for every exercise: nothing here depends on what
// kind of exercise it is, except the number of the lightest start.
export function StartScreen({
  id,
  given,
  lightest,
}: {
  id: string;
  // What is already known and taken as is: the gym, the body weight.
  given?: string;
  lightest: string;
}) {
  return (
    <Chrome>
      <Header id={id} line="Новое упражнение" />
      <div className={s.scroll}>
        <div className={s.title}>С чего начнём?</div>
        {given && (
          <div className={s.given}>
            <span>{given}</span>
            <span className={s.change}>изменить</span>
          </div>
        )}
        <div className={s.options}>
          <div className={s.option}>
            <div className={s.optionBody}>
              <div className={s.optionTitle}>С самого лёгкого</div>
              <div className={s.optionNote}>
                Дальше подберём вес по ощущениям
              </div>
            </div>
            <div className={s.optionValue}>{lightest}</div>
          </div>
          <div className={s.option}>
            <div className={s.optionBody}>
              <div className={s.optionTitle}>Знаю свой вес</div>
              <div className={s.optionNote}>Введу сам, начнём с разминки</div>
            </div>
            <MdChevronRight className={s.chevron} />
          </div>
          <div className={s.option}>
            <MdSwapHoriz className={s.swap} />
            <div className={s.optionBody}>
              <div className={s.optionTitle}>Заменить упражнение</div>
              <div className={s.optionNote}>Выбрать другое на те же мышцы</div>
            </div>
            <MdChevronRight className={s.chevron} />
          </div>
        </div>
      </div>
    </Chrome>
  );
}

// Shown between the start and the first set, only for exercises one cannot
// escape from on failure.
export function SafetyScreen({
  id,
  title,
  text,
}: {
  id: string;
  title: string;
  text: string;
}) {
  return (
    <Chrome>
      <Header id={id} line="Новое упражнение" />
      <div className={s.scroll}>
        <div className={s.safetyBlock}>
          <MdOutlineShield className={s.safetyIcon} />
          <div className={s.safetyTitle}>{title}</div>
          <div className={s.safetyText}>{text}</div>
        </div>
      </div>
      <div className={s.action}>
        <span className={s.next}>Страховка есть, начинаю</span>
        <span className={clsx(s.skip, s.gap)}>Заменить упражнение</span>
      </div>
    </Chrome>
  );
}

// The ordinary set screen, as it looks once the start is chosen.

export function SetScreen({
  id,
  line,
  tone,
  weight,
  reps,
  target,
  current = 0,
  trouble,
}: {
  id: string;
  line: string;
  tone?: "pick" | "warm";
  weight: string;
  reps: number;
  target: string;
  current?: number;
  trouble?: boolean;
}) {
  const { asset, name } = exercise(id);
  return (
    <Chrome current={current}>
      <div className={s.stage}>
        {asset?.type === "cross-fade" && (
          <ExerciseAnimation startUrl={asset.startUrl} endUrl={asset.endUrl} />
        )}
        <div className={s.setName}>{name}</div>
        <div
          className={clsx(
            s.setLine,
            tone === "warm" && s.warm,
            tone === "pick" && s.pick,
          )}
        >
          {line}
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
        {trouble && <div className={s.trouble}>Не выходит?</div>}
      </div>
      <div className={s.action}>
        <span className={s.done}>Сделал</span>
      </div>
    </Chrome>
  );
}

// While the weight is being found, failure is not a possible answer for a
// set that starts from the lightest weight, and dropping it keeps one row.
const PICK_EFFORTS = ["Невесомо", "Легко", "Норм", "Тяжело"];

export function RestScreen({
  selected,
  main,
  sub,
  note,
  current = 1,
}: {
  selected: string;
  main: string;
  sub: string;
  note: string;
  current?: number;
}) {
  return (
    <Chrome current={current}>
      <div className={s.stage}>
        <div className={s.restLabel}>Отдых</div>
        <div className={s.time}>
          <span className={s.minutes}>01</span>
          <span>:</span>
          <span className={s.seconds}>47</span>
        </div>
        <div className={s.question}>Как прошёл подход?</div>
        <div className={s.keys}>
          {PICK_EFFORTS.map((effort) => (
            <span
              key={effort}
              className={clsx(s.key, effort === selected && s.keySelected)}
            >
              {effort}
            </span>
          ))}
        </div>
        <div className={s.nextLabel}>Дальше</div>
        <div className={s.nextMain}>{main}</div>
        <div className={s.nextSub}>{sub}</div>
        <div className={s.nextNote}>{note}</div>
      </div>
      <div className={s.action}>
        <span className={s.skip}>Пропустить отдых</span>
      </div>
    </Chrome>
  );
}

export interface Fact {
  name: string;
  weight: string;
  reps: string;
  when: string;
}

// The existing weight sheet, opened from «Знаю свой вес». Similar exercises
// from history live here, where the number is being typed, not on the start.
export function OwnWeightSheet({
  id,
  weightKg,
  note,
  facts,
}: {
  id: string;
  weightKg: number;
  note: string;
  facts: Fact[];
}) {
  return (
    <div className={s.sheetBackdrop}>
      <div className={s.sheet}>
        <div className={s.grip} />
        <div className={s.sheetTitle}>Рабочий вес</div>
        <div className={s.stepper}>
          <span className={s.stepButton}>−</span>
          <div className={s.sheetValue}>
            {weightKg}
            <span className={s.units}>кг</span>
          </div>
          <span className={s.stepButton}>+</span>
        </div>
        <div className={s.visual}>
          <WeightsVisualizer
            exercise={exercise(id)}
            gym={defaultGym("mockup")}
            weightKg={weightKg}
          />
        </div>
        <div className={s.sheetNote}>{note}</div>
        {facts.length !== 0 && (
          <div className={s.facts}>
            <div className={s.label}>Похожие упражнения</div>
            {facts.map((fact) => (
              <div key={fact.name} className={s.fact}>
                <div className={s.factName}>{fact.name}</div>
                <div className={s.factLine}>
                  <span className={s.factWeight}>{fact.weight}</span>
                  <span className={s.factReps}>{fact.reps}</span>
                  <span className={s.factWhen}>{fact.when}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className={s.sheetAction}>
          <span className={s.next}>Начать</span>
        </div>
      </div>
    </div>
  );
}

// One list of replacements, whether it is opened before the first set or
// from «Не выходит?» on any set.
export function ReplaceScreen({
  id,
  line,
  stop,
}: {
  id: string;
  line: string;
  stop?: boolean;
}) {
  return (
    <Chrome current={0}>
      <Header id={id} line={line} />
      <div className={s.scroll}>
        <div className={s.title}>Заменить упражнение</div>
        <div className={s.text}>
          Другие упражнения на те же мышцы.
          {stop && " Сделанные подходы сохранятся."}
        </div>
        <div className={s.options}>
          {exercise(id).alternatives.map((alternative) => (
            <div key={alternative.id} className={s.option}>
              <div className={s.optionBody}>
                <div className={s.optionTitle}>
                  {exercise(alternative.id).name}
                </div>
                <div className={s.optionNote}>{alternative.benefits}</div>
              </div>
              <MdChevronRight className={s.chevron} />
            </div>
          ))}
        </div>
      </div>
      {stop && (
        <div className={s.action}>
          <span className={s.skip}>Закончить упражнение</span>
        </div>
      )}
    </Chrome>
  );
}
