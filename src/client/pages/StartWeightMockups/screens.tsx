import s from "./screens.module.scss";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
  MdArrowBack,
  MdChevronRight,
  MdEdit,
  MdFitnessCenter,
  MdSwapHoriz,
  MdWarningAmber,
} from "react-icons/md";
import { defaultGym, type Gym } from "../../db";
import { EXERCISES } from "../../db/exercises/constants.ts";
import { ExerciseAnimation } from "../WorkoutFocus/components/ExerciseAnimation";
import { WeightsVisualizer } from "../Workout/components";

const MOCK_GYM: Gym = {
  ...defaultGym("mockup"),
  dumbbells: [{ units: "kg", min: 2, max: 30, step: 2 }],
  stacks: {
    preacher_curl_machine: { units: "kg", base: 10, step: 5 },
    assisted_pull_up_wide: { units: "kg", base: 5, step: 5 },
  },
};

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

// The exercise name is context here, the question below is what the screen
// is about, so the name steps back.
function Header({ id, title }: { id: string; title: string }) {
  return (
    <div className={s.header}>
      <div className={s.name}>{exercise(id).name}</div>
      <div className={s.title}>{title}</div>
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

function Option({
  icon,
  title,
  note,
  value,
  warning,
  primary,
  disabled,
}: {
  icon: ReactNode;
  title: string;
  note: string;
  value?: string;
  warning?: string;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={clsx(s.option, primary && s.primary, disabled && s.disabled)}
    >
      <span className={s.optionIcon}>{icon}</span>
      <div className={s.optionBody}>
        <div className={s.optionTitle}>{title}</div>
        <div className={s.optionNote}>{note}</div>
        {warning && <div className={s.optionWarning}>{warning}</div>}
      </div>
      {value ? (
        <div className={s.optionValue}>{value}</div>
      ) : (
        !disabled && <MdChevronRight className={s.chevron} />
      )}
    </div>
  );
}

// When the lightest the gym has is heavier than a safe start, the light
// start is either shown switched off with the reason, or left out with the
// reason above the rest. The default then moves to the replacement.
export type Blocked = { mode: "disabled" | "hidden"; text: string };

// The same three buttons for every exercise. Only the number on the first
// one depends on it.
export function StartScreen({
  id,
  given,
  lightest,
  warning,
  blocked,
}: {
  id: string;
  // What is already known and taken as is: the gym, the body weight.
  given?: string;
  lightest: string;
  warning?: string;
  blocked?: Blocked;
}) {
  return (
    <Chrome>
      <Header id={id} title="С чего начнём?" />
      <div className={s.scroll}>
        {given && (
          <div className={s.given}>
            <span>{given}</span>
            <span className={s.change}>изменить</span>
          </div>
        )}
        {blocked?.mode === "hidden" && (
          <div className={s.alert}>
            <MdWarningAmber className={s.alertIcon} />
            <span>{blocked.text}</span>
          </div>
        )}
        <div className={s.options}>
          {blocked?.mode !== "hidden" && (
            <Option
              primary={!blocked}
              disabled={!!blocked}
              icon={blocked ? <MdWarningAmber /> : <MdFitnessCenter />}
              title="С лёгкого веса"
              note={blocked ? blocked.text : "Подберём по ощущениям"}
              value={lightest}
              warning={warning}
            />
          )}
          <Option icon={<MdEdit />} title="Знаю рабочий вес" note="Введу сам" />
          <Option
            primary={!!blocked}
            icon={<MdSwapHoriz />}
            title="Заменить упражнение"
            note="Другое на те же мышцы"
          />
        </div>
      </div>
    </Chrome>
  );
}

// Variant B: no choice of start at all. The weight sheet becomes the page,
// set to the safe weight; everything else is a line around it.

export type WeightLayout = "picture" | "compact" | "thumb";

export function WeightPage({
  id,
  layout,
  weightKg,
  value,
  under,
  given,
  warning,
  warmup,
  pick,
  facts = [],
}: {
  id: string;
  layout: WeightLayout;
  weightKg: number;
  value: string;
  // What the number means where it is not obvious: a pair of dumbbells, help.
  under?: string;
  given?: string;
  warning?: string;
  warmup?: string;
  // Said while the number is still the safe start the page opened with.
  pick?: string;
  facts?: Fact[];
}) {
  const { asset } = exercise(id);

  const picture = asset?.type === "cross-fade" && (
    <div className={s.pagePicture}>
      <ExerciseAnimation startUrl={asset.startUrl} endUrl={asset.endUrl} />
    </div>
  );

  const weight = (
    <div className={s.pageWeight}>
      <div className={s.stepper}>
        <span className={s.stepButton}>−</span>
        <div className={s.sheetValue}>
          {value}
          <span className={s.units}>кг</span>
        </div>
        <span className={s.stepButton}>+</span>
      </div>
      {under && <div className={s.pageUnder}>{under}</div>}
      {pick && <div className={s.pagePick}>{pick}</div>}
      <div className={s.pageVisual}>
        <WeightsVisualizer
          exercise={exercise(id)}
          gym={MOCK_GYM}
          weightKg={weightKg}
        />
      </div>
    </div>
  );

  const notes = (
    <div className={s.pageNotes}>
      {warning && (
        <div className={s.alert}>
          <MdWarningAmber className={s.alertIcon} />
          <span>{warning}</span>
        </div>
      )}
      {warmup && <div className={s.pageWarmup}>{warmup}</div>}
      {facts.length !== 0 && (
        <div className={s.pageFacts}>
          <div className={s.label}>Последний раз в похожих</div>
          {facts.map((fact) => (
            <div key={fact.name} className={s.fact}>
              <span className={s.factName}>{fact.name}</span>
              <span className={s.factBest}>{fact.best}</span>
            </div>
          ))}
        </div>
      )}
      {given && (
        <div className={s.given}>
          <span>{given}</span>
          <span className={s.change}>изменить</span>
        </div>
      )}
    </div>
  );

  return (
    <Chrome>
      <Header id={id} title="Первый подход" />
      <div className={clsx(s.scroll, layout === "thumb" && s.bottomUp)}>
        {layout === "picture" && picture}
        {layout === "thumb" ? notes : weight}
        {layout === "thumb" ? weight : notes}
      </div>
      <div className={s.action}>
        <span className={s.next}>Начать</span>
        <span className={s.textLink}>Заменить упражнение</span>
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
}: {
  id: string;
  line: string;
  tone?: "pick" | "warm";
  weight: string;
  reps: number;
  target: string;
  current?: number;
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
      </div>
      <div className={s.action}>
        <span className={s.done}>Сделал</span>
      </div>
    </Chrome>
  );
}

// While the weight is being found, failure is not a possible answer for a
// set that starts light, and dropping it keeps one row.
const PICK_EFFORTS = ["Мало", "Легко", "Норм", "Тяжело"];

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
  best: string;
}

// The existing weight sheet, opened from «Знаю рабочий вес». Similar exercises
// show the best set of their last workout, written like the set screen.
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
            gym={MOCK_GYM}
            weightKg={weightKg}
          />
        </div>
        <div className={s.sheetNote}>{note}</div>
        {facts.length !== 0 && (
          <div className={s.facts}>
            <div className={s.label}>Последний раз в похожих</div>
            {facts.map((fact) => (
              <div key={fact.name} className={s.fact}>
                <span className={s.factName}>{fact.name}</span>
                <span className={s.factBest}>{fact.best}</span>
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

export function ReplaceScreen({ id }: { id: string }) {
  return (
    <Chrome current={0}>
      <Header id={id} title="Заменить упражнение" />
      <div className={s.scroll}>
        <div className={s.text}>Другие упражнения на те же мышцы.</div>
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
    </Chrome>
  );
}
