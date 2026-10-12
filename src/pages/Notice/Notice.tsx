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
  MdEdit,
  MdHistory,
  MdLock,
  MdPause,
  MdPersonOutline,
  MdQuestionMark,
  MdTune,
  MdViewList,
} from "react-icons/md";
import { PageHeader, useModalStack, useStore } from "../../components";
import {
  type Exercise,
  type Performance,
  queryExerciseById,
  type Store,
  updatePerformance,
  updateSet,
} from "../../db";
import {
  minimumWeightKg,
  type PendingWeight,
  queryMissingInventory,
  queryPendingWeight,
  replacePerformance,
  type WeightIncrease,
} from "../../domain";
import { usePageParams } from "../hooks.ts";
import { UNITS_SHORT } from "../constants.ts";
import { WeightSheet } from "../Workout/components/WeightSheet";
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

type NoticeType = "order" | "inventory" | "weight";

interface Choice {
  icon: ReactNode;
  title: string;
  text: string;
  isAdvice?: boolean;
  onClick: () => void;
}

interface NoticeContent {
  tone: "good" | "dim";
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

  const customWeight = async () => {
    const first = sets.find((set) => set.type === "working");
    if (first) await pushModal(WeightSheet, { performance, setId: first.id });
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
  } else if (current === "weight" && pending?.type === "increase") {
    const { increase } = pending;
    content = increaseContent(increase, {
      formatWeight,
      lastReps: prevSets
        .filter((set) => set.type === "working")
        .map((set) => set.reps),
      raise: () => writeWeight(increase.to),
      stay: () => writeWeight(increase.from),
      custom: customWeight,
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

interface IncreaseOptions {
  formatWeight: (weightKg: number) => string;
  lastReps: number[];
  raise: () => void;
  stay: () => void;
  custom: () => void;
}

function increaseContent(
  increase: WeightIncrease,
  { formatWeight, lastReps, raise, stay, custom }: IncreaseOptions,
): NoticeContent {
  const { range } = increase;
  return {
    tone: "good",
    icon: <MdArrowUpward />,
    kicker: "Новый вес",
    title: `Пора прибавить: ${formatWeight(increase.to)}`,
    text: "В прошлый раз все подходы на максимум. Ты стал сильнее.",
    info: (
      <div className={s.reps}>
        <span>Прошлый раз</span>
        {lastReps.map((reps, index) => (
          <b key={index} className={clsx(reps >= range.max && s.top)}>
            {reps}
          </b>
        ))}
        <span>
          цель {range.min}–{range.max}
        </span>
      </div>
    ),
    choices: [
      {
        icon: <MdArrowUpward />,
        title: formatWeight(increase.to),
        text: `Хватит сил на ${range.min}+ повторов`,
        isAdvice: true,
        onClick: raise,
      },
      {
        icon: <MdPause />,
        title: `Остаться на ${formatWeight(increase.from)}`,
        text: "Если сегодня не в форме",
        onClick: stay,
      },
      {
        icon: <MdEdit />,
        title: "Свой вес",
        text: "Выберу сам",
        onClick: custom,
      },
    ],
  };
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
    tone: "dim",
    icon: <MdTune />,
    kicker: "Инвентарь",
    title: "Что есть в зале?",
    text:
      "Без этого приложение не соберёт вес из того, что есть, и не " +
      "посчитает разминку. Отмечается один раз, дальше переносится сам.",
    choices: [
      {
        icon: <MdTune />,
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
      tone: "dim",
      icon: <MdQuestionMark />,
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
    tone: "dim",
    icon: <MdHistory />,
    kicker: "Долгий перерыв",
    title: "Какой вес взять?",
    text:
      `Последний раз ${RELATIVE_TIME.format(-months, "month")}, ` +
      `с весом ${formatWeight(last.weight)}. За это время сила могла уйти, ` +
      "поэтому вес выбираешь ты.",
    choices,
  };
}
