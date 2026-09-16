import s from "./styles.module.scss";
import { MdArrowBack, MdCheck } from "react-icons/md";
import { useState } from "react";
import {
  addExercise,
  DEFAULT_EXERCISE_WEIGHT,
  type EquipmentTag,
  type Exercise,
  type ExerciseLoad,
  type ExerciseWeight,
  type MuscleType,
  type RepRange,
  updateExercise,
  generateId,
} from "../../../../db";
import { CustomRepsModal } from "../CustomRepsModal";
import {
  EQUIPMENT_TRANSLATION,
  EXERCISE_WEIGHT_TRANSLATION,
  LOAD_TRANSLATION,
  MUSCLES_TRANSLATION,
  REP_RANGE_PRESETS,
} from "../../../constants.ts";
import { formatRepRange } from "../SetRow/utils.ts";
import { clsx } from "clsx";
import {
  type ModalProps,
  PageModal,
  useModalStack,
  useStore,
} from "../../../../components";

const DEFAULT_LOAD: ExerciseLoad = { type: "none" };

const COUNTS = [1, 2] as const;

export function AddExercise({
  data: exercise,
  onCancel,
  onSubmit,
}: ModalProps<Exercise | null, Exercise>) {
  const store = useStore();
  const { pushModal } = useModalStack();
  const [name, setName] = useState(() => exercise?.name ?? "");
  const trimmedName = name.trim();
  const [equipment, setEquipment] = useState<EquipmentTag[]>(
    () => exercise?.equipment ?? [],
  );
  const [load, setLoad] = useState<ExerciseLoad>(
    () => exercise?.load ?? DEFAULT_LOAD,
  );
  const [weight, setWeight] = useState(
    () => exercise?.weight ?? DEFAULT_EXERCISE_WEIGHT,
  );
  const [reps, setReps] = useState<RepRange>(
    () => exercise?.reps ?? REP_RANGE_PRESETS[0],
  );
  const [primaryMuscles, setPrimaryMuscles] = useState<MuscleType[]>(
    () => exercise?.primaryMuscles ?? [],
  );
  const [secondaryMuscles, setSecondaryMuscles] = useState<MuscleType[]>(
    () => exercise?.secondaryMuscles ?? [],
  );

  const muscles = Object.entries(MUSCLES_TRANSLATION).map(([key, label]) => ({
    key: key as MuscleType,
    label,
  }));

  const equipments = Object.entries(EQUIPMENT_TRANSLATION).map(
    ([key, label]) => ({
      key: key as EquipmentTag,
      label,
    }),
  );

  const loads = Object.entries(LOAD_TRANSLATION).map(([key, label]) => ({
    key: key as ExerciseLoad["type"],
    label,
  }));

  const weights = Object.entries(EXERCISE_WEIGHT_TRANSLATION).map(
    ([key, label]) => ({
      key: key as ExerciseWeight["type"],
      label,
    }),
  );

  const selfWeightPercentages = [0, 25, 50, 75, 100];

  const isPresetReps = REP_RANGE_PRESETS.some((r) => isSameRange(r, reps));

  const disabled =
    !trimmedName ||
    primaryMuscles.length === 0 ||
    primaryMuscles.some((m) => secondaryMuscles.includes(m));

  const setWeightHandler = (type: ExerciseWeight["type"]) => {
    switch (type) {
      case "full":
        setWeight({ type: "full" });
        break;

      case "positive":
        setWeight({ type: "positive", selfWeightPercent: 50 });
        break;

      case "negative":
        setWeight({ type: "negative", selfWeightPercent: 50 });
        break;
    }
  };

  const setLoadHandler = (type: ExerciseLoad["type"]) => {
    switch (type) {
      case "dumbbell":
        setLoad({ type, count: 2 });
        break;

      case "plates":
        setLoad({ type, sides: 2 });
        break;

      default:
        setLoad({ type });
        break;
    }
  };

  const customRepsHandler = async () => {
    const result = await pushModal(CustomRepsModal, reps);
    if (result) setReps(result);
  };

  const submitHandler = () => {
    if (disabled) return;

    const data = {
      name: trimmedName,
      primaryMuscles,
      secondaryMuscles,
      equipment,
      load,
      weight,
      reps,
    };

    if (exercise) {
      const newExercise = { ...exercise, ...data };
      updateExercise(store, newExercise);
      onSubmit(newExercise);
    } else {
      const newExercise = addExercise(store, {
        id: generateId(),
        ...data,
        alternatives: [],
        instructions: [],
      });
      onSubmit(newExercise);
    }
  };

  return (
    <PageModal>
      <div className={s.root}>
        <div className={s.toolbar}>
          <button className={s.toolbarButton} onClick={onCancel}>
            <MdArrowBack />
          </button>
          <div className={s.pageTitle}>Создать упражнение</div>
          <button
            className={s.toolbarButton}
            disabled={disabled}
            onClick={submitHandler}
          >
            <MdCheck />
          </button>
        </div>
        <div className={s.body}>
          <label className={s.label}>Название упражнения</label>
          <input
            className={s.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className={s.label}>Оборудование</label>
          <div className={s.chips}>
            {equipments.map((eq) => (
              <button
                className={clsx(
                  s.chip,
                  equipment.includes(eq.key) && s.selected,
                )}
                key={eq.key}
                onClick={() => setEquipment(toggle(equipment, eq.key))}
              >
                {eq.label}
              </button>
            ))}
          </div>
          <label className={s.label}>Чем набирается вес</label>
          <div className={s.chips}>
            {loads.map((l) => (
              <button
                className={clsx(s.chip, load.type === l.key && s.selected)}
                key={l.key}
                onClick={() => setLoadHandler(l.key)}
              >
                {l.label}
              </button>
            ))}
          </div>
          {load.type === "dumbbell" && (
            <>
              <label className={s.label}>Количество гантелей</label>
              <div className={s.chips}>
                {COUNTS.map((count) => (
                  <button
                    className={clsx(s.chip, load.count === count && s.selected)}
                    key={count}
                    onClick={() => setLoad({ ...load, count })}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </>
          )}
          {load.type === "plates" && (
            <>
              <label className={s.label}>Сколько сторон нагружать</label>
              <div className={s.chips}>
                {COUNTS.map((sides) => (
                  <button
                    className={clsx(s.chip, load.sides === sides && s.selected)}
                    key={sides}
                    onClick={() => setLoad({ ...load, sides })}
                  >
                    {sides}
                  </button>
                ))}
              </div>
            </>
          )}
          <label className={s.label}>Тип веса</label>
          <div className={s.chips}>
            {weights.map((w) => (
              <button
                className={clsx(s.chip, weight.type === w.key && s.selected)}
                key={w.key}
                onClick={() => setWeightHandler(w.key)}
              >
                {w.label}
              </button>
            ))}
          </div>
          {weight.type !== "full" && (
            <>
              <label className={s.label}>Процент собственного веса</label>
              <div className={s.chips}>
                {selfWeightPercentages.map((p) => (
                  <button
                    className={clsx(
                      s.chip,
                      weight.selfWeightPercent === p && s.selected,
                    )}
                    key={p}
                    onClick={() =>
                      setWeight({ ...weight, selfWeightPercent: p })
                    }
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </>
          )}
          <label className={s.label}>Диапазон повторений</label>
          <div className={s.chips}>
            {REP_RANGE_PRESETS.map((range) => (
              <button
                className={clsx(s.chip, isSameRange(range, reps) && s.selected)}
                key={formatRepRange(range)}
                onClick={() => setReps(range)}
              >
                {formatRepRange(range)}
              </button>
            ))}
            <button
              className={clsx(s.chip, !isPresetReps && s.selected)}
              onClick={customRepsHandler}
            >
              {isPresetReps ? "Свой" : formatRepRange(reps)}
            </button>
          </div>
          <label className={s.label}>Основные мышцы</label>
          <div className={s.chips}>
            {muscles.map((muscle) => (
              <button
                className={clsx(
                  s.chip,
                  primaryMuscles.includes(muscle.key) && s.selected,
                )}
                key={muscle.key}
                onClick={() =>
                  setPrimaryMuscles(toggle(primaryMuscles, muscle.key))
                }
              >
                {muscle.label}
              </button>
            ))}
          </div>
          <label className={s.label}>Другие мышцы</label>
          <div className={s.chips}>
            {muscles.map((muscle) => (
              <button
                className={clsx(
                  s.chip,
                  secondaryMuscles.includes(muscle.key) && s.selected,
                )}
                key={muscle.key}
                onClick={() =>
                  setSecondaryMuscles(toggle(secondaryMuscles, muscle.key))
                }
              >
                {muscle.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageModal>
  );
}

function toggle<T>(array: T[], value: T): T[] {
  return array.includes(value)
    ? array.filter((v) => v !== value)
    : [...array, value];
}

function isSameRange(a: RepRange, b: RepRange): boolean {
  return a.min === b.min && a.max === b.max;
}
