import {
  useQueryActiveWorkouts,
  useQueryCompletedWorkouts,
  type Workout,
} from "../../db";
import s from "./styles.module.scss";
import { FUTURE_WEEKS, PAST_WEEKS } from "./constants.ts";
import { MdAdd, MdExpandMore, MdPlayArrow } from "react-icons/md";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { useUser } from "../../firebase/auth.ts";
import {
  HeaderButton,
  PageHeader,
  useModalStack,
  useStore,
} from "../../components";
import {
  addWorkout,
  cancelWorkout,
  duplicateWorkout,
  setWorkoutRepeat,
} from "../../domain";
import {
  ActiveWorkoutCard,
  CancelWorkoutModal,
  MonthSheet,
  PlannedWorkoutCard,
  ScheduleSheet,
  WeekStrip,
  WorkoutActionsSheet,
  WorkoutCard,
} from "./components";
import {
  addDays,
  buildDayMarks,
  buildWeeks,
  dayKey,
  findWeek,
  formatDay,
  formatMonth,
  parseDayKey,
  startOfWeek,
} from "./calendar.ts";
import { buildPlan } from "./schedule.ts";

// The selected day lives in the address, so coming back from a workout
// returns to it. Today is the default and leaves the address clean.
export function Home() {
  const user = useUser();
  const store = useStore();
  const navigate = useNavigate();
  const { pushModal } = useModalStack();
  const [searchParams, setSearchParams] = useSearchParams();
  const completedWorkouts = useQueryCompletedWorkouts(store);
  const [activeWorkout] = useQueryActiveWorkouts(store);
  const workouts = activeWorkout
    ? [activeWorkout, ...completedWorkouts]
    : completedWorkouts;

  const today = dayKey(Date.now());
  const todayDate = parseDayKey(today);
  const selected = searchParams.get("day") ?? today;
  const selectedDate = parseDayKey(selected);
  const [shownWeek, setShownWeek] = useState(() =>
    dayKey(startOfWeek(selectedDate)),
  );

  // Every navigation here picks a day, from this page or from the tab bar,
  // and the strip moves to show it.
  const { key } = useLocation();
  const [shownKey, setShownKey] = useState(key);
  if (shownKey !== key) {
    setShownKey(key);
    setShownWeek(dayKey(startOfWeek(selectedDate)));
  }

  const oldest = workouts.at(-1)?.startedAt ?? Date.now();
  const firstDay = [
    dayKey(addDays(todayDate, -PAST_WEEKS * 7)),
    dayKey(oldest),
    selected,
  ].sort()[0];
  const lastDay = [dayKey(addDays(todayDate, FUTURE_WEEKS * 7)), selected]
    .sort()
    .at(-1)!;
  const weeks = useMemo(
    () => buildWeeks(parseDayKey(firstDay), parseDayKey(lastDay)),
    [firstDay, lastDay],
  );
  const week = Math.max(findWeek(weeks, shownWeek), 0);
  const plan = buildPlan(workouts, firstDay, lastDay, today);
  const marks = buildDayMarks(workouts, plan);

  const dayWorkouts = workouts
    .filter((w) => dayKey(w.startedAt) === selected)
    .sort((a, b) => a.startedAt - b.startedAt);
  const dayPlan = plan.get(selected) ?? [];
  const isEmpty = dayWorkouts.length === 0 && dayPlan.length === 0;
  const isToday = selected === today;
  const titleDate = weeks[week].some((d) => dayKey(d) === selected)
    ? selectedDate
    : weeks[week][3];

  const selectHandler = (day: string) => {
    setSearchParams(day === today ? {} : { day }, { replace: true });
  };

  const pickDayHandler = async () => {
    const day = await pushModal(MonthSheet, {
      month: titleDate,
      selected,
      today,
      marks,
    });
    if (day) selectHandler(day);
  };

  const openWorkoutHandler = (workout: Workout) => {
    navigate(`/workouts/${workout.id}`);
  };

  const startWorkoutHandler = () => {
    openWorkoutHandler(addWorkout(store, user.uid));
  };

  const cancelWorkoutHandler = async (workout: Workout) => {
    const confirm = await pushModal(CancelWorkoutModal, null);
    if (confirm) cancelWorkout(store, workout);
  };

  const startPlannedHandler = (template: Workout) => {
    openWorkoutHandler(duplicateWorkout(store, template));
  };

  // A rule set from a workout counts from its day, unless it repeats already.
  const scheduleHandler = async (workout: Workout) => {
    const result = await pushModal(ScheduleSheet, {
      workout,
      from: workout.repeat?.from ?? dayKey(workout.startedAt),
      today,
    });
    if (result) setWorkoutRepeat(store, workout, result.rule);
  };

  const workoutActionsHandler = async (workout: Workout) => {
    const action = await pushModal(WorkoutActionsSheet, {
      workout,
      canDuplicate: !activeWorkout,
    });

    if (action === "open") {
      openWorkoutHandler(workout);
    } else if (action === "duplicate") {
      // The copy starts today, so the way back from it leads there.
      selectHandler(today);
      openWorkoutHandler(duplicateWorkout(store, workout));
    } else if (action === "schedule") {
      await scheduleHandler(workout);
    } else if (action === "delete") {
      await cancelWorkoutHandler(workout);
    }
  };

  return (
    <div className={s.root}>
      <PageHeader
        start
        title={
          <span className={s.month}>
            {formatMonth(titleDate, todayDate)}
            <MdExpandMore />
          </span>
        }
        onTitleClick={pickDayHandler}
        right={
          <HeaderButton
            primary
            disabled={isToday && weeks[week].some((d) => dayKey(d) === today)}
            onClick={() => selectHandler(today)}
          >
            Сегодня
          </HeaderButton>
        }
      >
        <WeekStrip
          weeks={weeks}
          week={week}
          selected={selected}
          today={today}
          marks={marks}
          onSelect={selectHandler}
          onWeekChange={(index) => setShownWeek(dayKey(weeks[index][0]))}
        />
      </PageHeader>
      <div className={s.body}>
        <div className={s.day}>{formatDay(selectedDate, todayDate)}</div>
        {dayWorkouts.map((workout) =>
          workout.completedAt === null ? (
            <ActiveWorkoutCard
              key={workout.id}
              workout={workout}
              onContinue={() => openWorkoutHandler(workout)}
              onCancel={() => cancelWorkoutHandler(workout)}
            />
          ) : (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onClick={() => workoutActionsHandler(workout)}
            />
          ),
        )}
        {dayPlan.map((planned) => (
          <PlannedWorkoutCard
            key={planned.template.repeat!.id}
            planned={planned}
            canStart={isToday && !activeWorkout}
            onStart={() => startPlannedHandler(planned.template)}
            onClick={() => scheduleHandler(planned.template)}
          />
        ))}
        {isEmpty && (
          <div className={s.empty}>
            <div className={s.emptyTitle}>
              {isToday
                ? "Сегодня без тренировки"
                : selected < today
                  ? "В этот день не тренировались"
                  : "Ничего не запланировано"}
            </div>
            {!isToday && (
              <div className={s.emptyNote}>
                {selected < today
                  ? "Тренировку можно начать только сегодня"
                  : "Расписание задаётся в меню прошедшей тренировки"}
              </div>
            )}
          </div>
        )}
        {isToday && !dayWorkouts.some((w) => w.completedAt === null) && (
          <button
            className={clsx(s.start, !isEmpty && s.secondary)}
            onClick={() =>
              activeWorkout
                ? openWorkoutHandler(activeWorkout)
                : startWorkoutHandler()
            }
          >
            {activeWorkout ? <MdPlayArrow /> : <MdAdd />}
            {activeWorkout
              ? "Продолжить тренировку"
              : isEmpty
                ? "Начать тренировку"
                : "Новая тренировка"}
          </button>
        )}
      </div>
    </div>
  );
}
