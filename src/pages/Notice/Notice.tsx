import s from "./styles.module.scss";
import { type ReactNode, useState } from "react";
import { useSetAtom } from "jotai";
import { Navigate, useLocation, useNavigate } from "react-router";
import { clsx } from "clsx";
import {
  MdArrowDownward,
  MdArrowForward,
  MdArrowUpward,
  MdAutorenew,
  MdBuild,
  MdEdit,
  MdLock,
  MdPause,
  MdPersonOutline,
  MdViewList,
} from "react-icons/md";
import { PageHeader, useModalStack, useStore } from "../../components";
import {
  type CompletedSet,
  type Exercise,
  type Performance,
  queryExerciseById,
  type Store,
  updatePerformance,
  updateSet,
  type WeightUnits,
} from "../../db";
import {
  minimumWeightKg,
  type PendingWeight,
  queryMissingInventory,
  queryPendingWeight,
  type RepRange,
  replacePerformance,
  type WeightChange,
  type WeightPattern,
} from "../../domain";
import { usePageParams } from "../hooks.ts";
import { UNITS_SHORT } from "../constants.ts";
import { WeightsSelectorModal } from "../Workout/components/WeightsSelectorModal";
import { ChooseExerciseModal } from "../Workout/components/ChooseExerciseModal";
import {
  formatWeightUnits,
  usePerformanceSets,
  useWorkoutState,
  type WorkoutState,
} from "../Workout/hooks.ts";
import type { PerformanceParams } from "../Performance/types.ts";
import { JUST_REPLACED_ATOM } from "../Workout/constants.ts";
import { StartWeightSheet } from "./components/StartWeightSheet";
import {
  ExerciseMarkIcon,
  type ExerciseMarkType,
} from "../Workout/components/ExerciseMark";

type NoticeType = "order" | "inventory" | "weight";

interface Choice {
  icon: ReactNode;
  title: string;
  text: string;
  isAdvice?: boolean;
  onClick: () => void;
}

interface NoticeContent {
  tone: ExerciseMarkType | "dim";
  icon: ReactNode;
  kicker: string;
  title: string;
  text: string;
  info?: ReactNode;
  choices: Choice[];
}

// What comes up before an exercise, one at a time: a warning about the order,
// the inventory and a weight to pick. Nothing here is stored but the answers
// that change the data, so the queue is read again from the workout on every
// render.
export function Notice() {
  const { workoutId, performanceId } = usePageParams<PerformanceParams>();
  const workout = useWorkoutState(workoutId);
  const performance = workout.performances.find((p) => p.id === performanceId);

  if (!performance) return null;
  return <NoticeQueue workout={workout} performance={performance} />;
}

interface NoticeQueueProps {
  workout: WorkoutState;
  performance: Performance;
}

function NoticeQueue({ workout, performance }: NoticeQueueProps) {
  const store = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { pushModal } = useModalStack();
  const { exercise, sets, prevSets, units } = usePerformanceSets(performance);
  const [isOrderAccepted, setOrderAccepted] = useState(false);
  const setJustReplaced = useSetAtom(JUST_REPLACED_ATOM);

  const exercisePath = `/workouts/${performance.workout}/performances/${performance.id}`;
  const isLocked = workout.statuses.get(performance.id) === "locked";
  const isInventoryMissing = queryMissingInventory(store, performance);
  const pending = queryPendingWeight(store, performance);

  const notices: NoticeType[] = [];
  if (isLocked) notices.push("order");
  if (isInventoryMissing) notices.push("inventory");
  if (pending) notices.push("weight");

  const queue = notices.filter((n) => n !== "order" || !isOrderAccepted);
  const current = queue.at(0);

  const formatWeight = (weightKg: number) =>
    `${formatWeightUnits(weightKg, units)} ${UNITS_SHORT[units]}`;

  const writeWeight = (weightKg: number) => {
    const first = sets.find((set) => set.type === "working");
    if (first) updateSet(store, { ...first, weight: weightKg });
  };

  const startWeight = async (initialKg: number) => {
    const weightKg = await pushModal(StartWeightSheet, {
      performance,
      initialKg,
    });
    if (weightKg !== undefined) writeWeight(weightKg);
  };

  const setInventory = async () => {
    const result = await pushModal(WeightsSelectorModal, {
      equipment: exercise?.equipment ?? "none",
      weights: performance.weights,
      previewKg: undefined,
    });
    if (result?.weights) {
      updatePerformance(store, { ...performance, weights: result.weights });
    }
  };

  const replaceExercise = async () => {
    const newExercise = await pushModal(ChooseExerciseModal, null);
    if (!newExercise) return;
    const newPerformance = replacePerformance(
      store,
      performance,
      newExercise.id,
    );
    setJustReplaced(newPerformance.id);
    goBack();
  };

  const goBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate(`/workouts/${performance.workout}`, { replace: true });
    }
  };

  let content: NoticeContent | null = null;
  if (current === "order") {
    content = orderContent(workout, performance, store, {
      back: goBack,
      accept: () => setOrderAccepted(true),
    });
  } else if (current === "inventory") {
    content = inventoryContent({
      setInventory,
      replace: replaceExercise,
    });
  } else if (current === "weight" && pending && pending.type !== "unknown") {
    content = changeContent(pending, {
      formatWeight,
      info: (weightKg: number) =>
        lastSetsInfo(prevSets, weightKg, pending.range, units),
      write: writeWeight,
      custom: startWeight,
      replace: replaceExercise,
    });
  } else if (current === "weight" && pending?.type === "unknown") {
    content = unknownContent(pending, exercise, performance, {
      formatWeight,
      minimum: writeWeight,
      none: () => writeWeight(0),
      custom: startWeight,
      replace: replaceExercise,
    });
  }

  if (!content) return <Navigate to={exercisePath} replace />;

  return (
    <div className={clsx(s.root, s[content.tone])}>
      <PageHeader
        kicker={exercise?.name}
        onBack={goBack}
        right={
          notices.length > 1 && (
            <div className={s.steps}>
              {notices.map((notice) => (
                <i
                  key={notice}
                  className={clsx(
                    notice === current && s.current,
                    !queue.includes(notice) && s.passed,
                  )}
                />
              ))}
            </div>
          )
        }
      />
      <div className={s.hero}>
        <div className={s.emblem}>{content.icon}</div>
        <div>
          <div className={s.kicker}>{content.kicker}</div>
          <h1 className={s.title}>{content.title}</h1>
        </div>
      </div>
      <p className={s.text}>{content.text}</p>
      {content.info}
      <div className={s.choices}>
        {content.choices.map((choice) => (
          <button
            key={choice.title}
            className={clsx(s.choice, choice.isAdvice && s.advice)}
            onClick={choice.onClick}
          >
            <span className={s.choiceIcon}>{choice.icon}</span>
            <span>
              <span className={s.choiceTitle}>{choice.title}</span>
              <span className={s.choiceText}>{choice.text}</span>
            </span>
            {choice.isAdvice && <span className={s.adviceBadge}>совет</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function orderContent(
  workout: WorkoutState,
  performance: Performance,
  store: Store,
  actions: { back: () => void; accept: () => void },
): NoticeContent {
  const name = (p: Performance) =>
    queryExerciseById(store, p.exercise)?.name ?? "–";
  const blockers = (workout.blockers.get(performance.id) ?? [])
    .map((id) => workout.performances.find((p) => p.id === id))
    .flatMap((p) => (p ? [name(p).toLowerCase()] : []));
  const open = workout.performances
    .filter((p) => p.id !== performance.id)
    .filter((p) => {
      const status = workout.statuses.get(p.id);
      return status === "new" || status === "progress";
    })
    .map(name);

  return {
    tone: "dim",
    icon: <MdLock />,
    kicker: "Не по порядку",
    title: `Сначала ${blockers.join(" и ")}`,
    text:
      "Выше в списке есть упражнение на те же мышцы. Если начать с этого, " +
      "мышцы придут уставшими, и веса с повторами разойдутся с прошлым разом.",
    choices: [
      {
        icon: <MdViewList />,
        title: "Вернуться к списку",
        text:
          open.length !== 0
            ? `Сейчас можно: ${open.join(", ")}`
            : "Выбрать другое упражнение",
        isAdvice: true,
        onClick: actions.back,
      },
      {
        icon: <MdArrowForward />,
        title: "Всё равно начать",
        text: "Например, нужный тренажёр занят",
        onClick: actions.accept,
      },
    ],
  };
}

interface ChangeOptions {
  formatWeight: (weightKg: number) => string;
  info: (weightKg: number) => ReactNode;
  write: (weightKg: number) => void;
  custom: (initialKg: number) => void;
  replace: () => void;
}

function changeContent(
  change: WeightChange,
  { formatWeight, info, write, custom, replace }: ChangeOptions,
): NoticeContent {
  const { range } = change;
  const enter = (initialKg: number): Choice => ({
    icon: <MdEdit />,
    title: "Ввести вес",
    text: "Знаю, сколько взять",
    onClick: () => custom(initialKg),
  });

  switch (change.type) {
    case "increase":
      return {
        tone: "increase",
        icon: <ExerciseMarkIcon type="increase" />,
        kicker: "Новый вес",
        title: `Пора прибавить: ${formatWeight(change.to)}`,
        text: "В прошлый раз все подходы на максимум. Ты стал сильнее.",
        info: info(change.from),
        choices: [
          {
            icon: <MdArrowUpward />,
            title: formatWeight(change.to),
            text: `Хватит сил на ${range.min}+ повторов`,
            isAdvice: true,
            onClick: () => write(change.to),
          },
          {
            icon: <MdPause />,
            title: `Остаться на ${formatWeight(change.from)}`,
            text: "Если сегодня не в форме",
            onClick: () => write(change.from),
          },
          enter(change.from),
        ],
      };

    case "decrease":
      return {
        tone: "decrease",
        icon: <ExerciseMarkIcon type="decrease" />,
        kicker: "Откат",
        title: `Снизим до ${formatWeight(change.to)}`,
        text:
          `В прошлый раз на ${formatWeight(change.from)} не хватило ` +
          `повторов до ${range.min}. На шаг легче наберёшь их и пойдёшь вверх.`,
        info: info(change.from),
        choices: [
          {
            icon: <MdArrowDownward />,
            title: formatWeight(change.to),
            text: "Шаг назад, чтобы снова расти",
            isAdvice: true,
            onClick: () => write(change.to),
          },
          {
            icon: <MdPause />,
            title: `Остаться на ${formatWeight(change.from)}`,
            text: "Ещё одна попытка",
            onClick: () => write(change.from),
          },
          enter(change.to),
        ],
      };

    case "lightest":
      return {
        tone: "decrease",
        icon: <ExerciseMarkIcon type="decrease" />,
        kicker: "Откат",
        title: "Легче некуда",
        text:
          `В прошлый раз на ${formatWeight(change.weight)} не хватило ` +
          `повторов до ${range.min}, а легче вес не собрать.`,
        info: info(change.weight),
        choices: [
          {
            icon: <MdAutorenew />,
            title: "Заменить упражнение",
            text: "На то, где есть куда снизить",
            isAdvice: true,
            onClick: replace,
          },
          {
            icon: <MdPause />,
            title: `Остаться на ${formatWeight(change.weight)}`,
            text: "Ещё одна попытка",
            onClick: () => write(change.weight),
          },
        ],
      };

    case "mixed":
      return {
        tone: "mixed",
        icon: <ExerciseMarkIcon type="mixed" />,
        kicker: PATTERN_KICKERS[change.pattern.type],
        title: `Начинаем с ${formatWeight(change.weight)}`,
        text: patternText(change.pattern, change.weight, range, formatWeight),
        info: change.pattern.type !== "search" && info(change.weight),
        choices: [
          {
            icon: <MdArrowForward />,
            title: `Начать с ${formatWeight(change.weight)}`,
            text: "Вес можно поменять в подходах",
            onClick: () => write(change.weight),
          },
        ],
      };
  }
}

const PATTERN_KICKERS: Record<WeightPattern["type"], string> = {
  search: "Подбор веса",
  settled: "Вес найден",
  above: "Попытка выше",
  below: "Снижение веса",
};

// One short line: the sets show the numbers, the line tells what they mean.
// A search has too many numbers to show, so it is only named.
function patternText(
  pattern: WeightPattern,
  weightKg: number,
  range: RepRange,
  formatWeight: (weightKg: number) => string,
): string {
  switch (pattern.type) {
    case "search":
      return `Ты подбирал вес. Берём последний, где набралось ${range.min}+.`;

    case "settled":
      return `В конце ты держал ${formatWeight(weightKg)}.`;

    case "above":
    case "below":
      if (weightKg === pattern.held) {
        return `На ${formatWeight(pattern.other)} ты не дотянул до ${range.min}.`;
      }
      if (pattern.type === "above") {
        return `На ${formatWeight(pattern.other)} ты набрал ${range.min}+.`;
      }
      return pattern.isHeldShort
        ? `На ${formatWeight(pattern.held)} повторы упали ниже ${range.min}.`
        : `Закончил ты на ${formatWeight(pattern.other)}.`;
  }
}

// The working sets of the last time against the weight the notice is about:
// the top and the short ones with it, the other weights dimmed.
function lastSetsInfo(
  sets: CompletedSet[],
  weightKg: number,
  range: RepRange,
  units: WeightUnits,
): ReactNode {
  const working = sets.filter((set) => set.type === "working");
  const isMixed = working.some((set) => set.weight !== weightKg);

  return (
    <div className={s.reps}>
      <span>Прошлый раз</span>
      {working.map((set, index) => (
        <b
          key={index}
          className={clsx(
            isMixed && s.withWeight,
            set.weight !== weightKg && s.other,
            set.weight === weightKg && set.reps >= range.max && s.top,
            set.weight === weightKg && set.reps < range.min && s.short,
          )}
        >
          {isMixed && `${formatWeightUnits(set.weight, units)}×`}
          {set.reps}
        </b>
      ))}
      <span>
        цель {range.min}–{range.max}
      </span>
    </div>
  );
}

interface InventoryOptions {
  setInventory: () => void;
  replace: () => void;
}

function inventoryContent({
  setInventory,
  replace,
}: InventoryOptions): NoticeContent {
  return {
    tone: "inventory",
    icon: <ExerciseMarkIcon type="inventory" />,
    kicker: "Инвентарь",
    title: "Что есть в зале?",
    text:
      "Без этого приложение не соберёт вес из того, что есть, и не " +
      "посчитает разминку. Отмечается один раз, дальше переносится сам.",
    choices: [
      {
        icon: <MdBuild />,
        title: "Отметить инвентарь",
        text: "Гриф, блины, гантели или плитки",
        onClick: setInventory,
      },
      {
        icon: <MdAutorenew />,
        title: "Заменить упражнение",
        text: "Нет снаряда или не хочу его",
        onClick: replace,
      },
    ],
  };
}

interface UnknownOptions {
  formatWeight: (weightKg: number) => string;
  minimum: (weightKg: number) => void;
  none: () => void;
  custom: (initialKg: number) => void;
  replace: () => void;
}

const RELATIVE_TIME = new Intl.RelativeTimeFormat("ru", { numeric: "auto" });
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function unknownContent(
  pending: Extract<PendingWeight, { type: "unknown" }>,
  exercise: Exercise | null,
  performance: Performance,
  { formatWeight, minimum, none, custom, replace }: UnknownOptions,
): NoticeContent {
  const { last } = pending;
  const type = exercise?.weight?.type ?? "full";
  const minimumKg =
    type !== "positive" && performance.weights
      ? minimumWeightKg(performance.weights)
      : 0;
  const choices: Choice[] = [];

  if (type === "positive") {
    choices.push({
      icon: <MdPersonOutline />,
      title: "Без отягощения",
      text: "Только свой вес",
      onClick: none,
    });
  } else if (type === "full" && performance.weights) {
    choices.push({
      icon: <MdArrowDownward />,
      title: `Минимум: ${formatWeight(minimumKg)}`,
      text: "Начну с лёгкого и прибавлю",
      onClick: () => minimum(minimumKg),
    });
  }

  choices.push(
    {
      icon: <MdEdit />,
      title: "Ввести вес",
      text: "Знаю, сколько взять",
      onClick: () => custom(minimumKg),
    },
    {
      icon: <MdAutorenew />,
      title: "Заменить упражнение",
      text: "Нет снаряда или не хочу его",
      onClick: replace,
    },
  );

  if (!last) {
    return {
      tone: "unknown",
      icon: <ExerciseMarkIcon type="unknown" />,
      kicker: "Первый раз",
      title: "Какой вес взять?",
      text: "Истории ещё нет, поэтому вес выбираешь ты. Дальше приложение будет считать от него.",
      choices,
    };
  }

  const months = Math.round(
    (performance.startedAt - last.startedAt) / MONTH_MS,
  );
  return {
    tone: "unknown",
    icon: <ExerciseMarkIcon type="unknown" />,
    kicker: "Долгий перерыв",
    title: "Какой вес взять?",
    text:
      `Последний раз ${RELATIVE_TIME.format(-months, "month")}, ` +
      `с весом ${formatWeight(last.weight)}. За это время сила могла уйти, ` +
      "поэтому вес выбираешь ты.",
    choices,
  };
}
