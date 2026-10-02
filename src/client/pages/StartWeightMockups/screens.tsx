import s from "./screens.module.scss";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { MdArrowBack, MdChevronRight, MdWarningAmber } from "react-icons/md";
import { defaultGym } from "../../db";
import { EXERCISES } from "../../db/exercises/constants.ts";
import { WeightsVisualizer } from "../Workout/components";
import { ExerciseAnimation } from "../WorkoutFocus/components/ExerciseAnimation";

const MOCK_GYM = defaultGym("mockup");

const exercise = (id: string) => {
  const found = EXERCISES[id];
  if (!found) throw new Error(`No exercise ${id}`);
  return found;
};

// Replacements leave out the known conflicts for a novice: a free barbell
// starts at the empty bar again, a whole-body exercise lifts the whole body
// again. The Smith machine is safe but its carriage may weigh what the bar
// does, so it goes last.
const isSmith = (id: string) => exercise(id).equipment.includes("smith");

const hasKnownConflict = (id: string) => {
  const { load, weight } = exercise(id);
  if (load.type === "barbell") return !isSmith(id);
  return weight?.type === "positive" && weight.selfWeightPercent === 100;
};

const safeAlternatives = (id: string) =>
  exercise(id)
    .alternatives.filter((alternative) => !hasKnownConflict(alternative.id))
    .sort((a, b) => Number(isSmith(a.id)) - Number(isSmith(b.id)));

function Chrome({
  sets = 9,
  children,
}: {
  sets?: number;
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

// The warning as one question; the list of replacements comes after
// «Заменить». The weight leads, since it is what the warning is about; with
// nothing added to the body there is no number worth showing, and the reason
// is the body weight itself.
export function WarningScreen({
  id,
  minimum,
}: {
  id: string;
  minimum: number;
}) {
  return (
    <Chrome>
      <div className={s.header}>
        <div className={s.name}>{exercise(id).name}</div>
      </div>
      <div className={s.warning}>
        {minimum === 0 ? (
          <span className={s.warningSign}>
            <MdWarningAmber />
          </span>
        ) : (
          <div className={s.warningWeight}>
            {minimum}
            <span className={s.warningUnits}>кг</span>
          </div>
        )}
        <div className={s.warningTitle}>Может быть тяжело</div>
        <div className={s.warningText}>
          <p>
            {minimum === 0
              ? "Здесь поднимаешь весь свой вес."
              : "Меньше здесь не поставить."}
          </p>
          <p>Если ты только начинаешь, лучше заменить упражнение.</p>
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

export interface WarmUp {
  number: number;
  count: number;
  workingKg: number;
}

// The set screen the app already has: on the start weight while the weight is
// being found, or on a warm-up once the person has raised the weight.
export function SetScreen({
  id,
  weight,
  reps,
  target,
  sets,
  warmUp,
}: {
  id: string;
  weight: string;
  reps: number;
  target: string;
  sets?: number;
  warmUp?: WarmUp;
}) {
  const { asset, name } = exercise(id);
  return (
    <Chrome sets={sets}>
      <div className={s.stage}>
        {asset?.type === "cross-fade" && (
          <ExerciseAnimation startUrl={asset.startUrl} endUrl={asset.endUrl} />
        )}
        <div className={s.setName}>{name}</div>
        {warmUp ? (
          <div className={clsx(s.setLine, s.warmUp)}>
            Разминка {warmUp.number} из {warmUp.count}
          </div>
        ) : (
          <div className={clsx(s.setLine, s.pick)}>
            Подбор веса · подход 1 из 3
          </div>
        )}
        <div className={s.numbers}>
          <div className={s.cell}>
            <div className={s.big}>
              {weight}
              <span className={s.units}>кг</span>
            </div>
            <div className={s.under}>
              {warmUp && `перед ${warmUp.workingKg} кг`}
            </div>
          </div>
          <div className={s.times}>×</div>
          <div className={s.cell}>
            <div className={s.big}>
              {reps}
              <span className={s.units}>раз</span>
            </div>
            <div className={s.under}>{!warmUp && `цель ${target}`}</div>
          </div>
        </div>
      </div>
      <div className={s.action}>
        <span className={s.done}>Сделал</span>
      </div>
    </Chrome>
  );
}

// The weight sheet the app already has. The line under the plates no longer
// repeats what they show; it names the warm-ups the chosen weight brings, so
// closing the sheet on a warm-up is what the person expects.
export function WeightSheetScreen({
  id,
  weightKg,
  warmUps,
}: {
  id: string;
  weightKg: number;
  warmUps: string[];
}) {
  return (
    <div className={s.sheetBackdrop}>
      <div className={s.sheet}>
        <div className={s.grip} />
        <div className={s.sheetTitle}>Вес</div>
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
            gym={MOCK_GYM}
            weightKg={weightKg}
          />
        </div>
        <div className={s.sheetWarmUp}>
          {warmUps.length !== 0 && `Сначала разминка: ${warmUps.join(", ")}`}
        </div>
        <div className={s.links}>
          <span className={s.link}>Ввести вручную</span>
          <span className={s.link}>Мой инвентарь</span>
        </div>
      </div>
    </div>
  );
}
