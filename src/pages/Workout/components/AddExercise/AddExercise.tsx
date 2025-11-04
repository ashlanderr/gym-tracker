import s from "./styles.module.scss";
import { MdArrowBack, MdCheck } from "react-icons/md";
import type { AddExerciseProps } from "./types.ts";
import { useState } from "react";
import {
  addExercise,
  DEFAULT_EXERCISE_WEIGHT,
  type EquipmentType,
  type ExerciseWeight,
  type MuscleType,
  updateExercise,
  generateId,
  DEFAULT_EXERCISE_REPS,
  type ExerciseRepRange,
} from "../../../../db";
import {
  EQUIPMENT_TRANSLATION,
  EXERCISE_WEIGHT_TRANSLATION,
  EXERCISES_REPS_TRANSLATION,
  MUSCLES_TRANSLATION,
} from "../../../constants.ts";
import { clsx } from "clsx";
import { useStore } from "../../../../components";

export function AddExercise({
  exercise,
  onCancel,
  onSubmit,
}: AddExerciseProps) {
  const store = useStore();
  const [name, setName] = useState(() => exercise?.name ?? "");
  const trimmedName = name.trim();
  const [equipment, setEquipment] = useState(
    () => exercise?.equipment ?? "none",
  );
  const [weight, setWeight] = useState(
    () => exercise?.weight ?? DEFAULT_EXERCISE_WEIGHT,
  );
  const [reps, setReps] = useState(
    () => exercise?.reps ?? DEFAULT_EXERCISE_REPS,
  );
  const [mainMuscle, setMainMuscle] = useState(
    () => exercise?.muscles?.[0] ?? null,
  );
  const [secondaryMuscles, setSecondaryMuscles] = useState(
    () => exercise?.muscles?.slice?.(1) ?? [],
  );

  const muscles = Object.entries(MUSCLES_TRANSLATION).map(([key, label]) => ({
    key: key as MuscleType,
    label,
  }));

  const equipments = Object.entries(EQUIPMENT_TRANSLATION).map(
    ([key, label]) => ({
      key: key as EquipmentType,
      label,
    }),
  );

  const weights = Object.entries(EXERCISE_WEIGHT_TRANSLATION).map(
    ([key, label]) => ({
      key: key as ExerciseWeight["type"],
      label,
    }),
  );

  const repsOptions = Object.entries(EXERCISES_REPS_TRANSLATION).map(
    ([key, label]) => ({
      key: key as ExerciseRepRange,
      label,
    }),
  );

  const selfWeightPercentages = [0, 25, 50, 75, 100];

  const disabled =
    !trimmedName || !mainMuscle || secondaryMuscles.includes(mainMuscle);

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

  const mainMuscleHandler = (muscle: MuscleType) => {
    setMainMuscle(mainMuscle === muscle ? null : muscle);
  };

  const secondaryMuscleHandler = (muscle: MuscleType) => {
    if (secondaryMuscles.includes(muscle)) {
      setSecondaryMuscles(secondaryMuscles.filter((m) => m !== muscle));
    } else {
      setSecondaryMuscles([...secondaryMuscles, muscle]);
    }
  };

  const submitHandler = () => {
    if (!trimmedName) return;
    if (!mainMuscle) return;

    if (exercise) {
      const newExercise = {
        ...exercise,
        name: trimmedName,
        muscles: [mainMuscle, ...secondaryMuscles],
        equipment,
        weight,
        reps,
      };
      updateExercise(store, newExercise);
      onSubmit(newExercise);
    } else {
      const newExercise = addExercise(store, {
        id: generateId(),
        name: trimmedName,
        muscles: [mainMuscle, ...secondaryMuscles],
        equipment,
        weight,
        reps,
      });
      onSubmit(newExercise);
    }
  };

  return (
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
              className={clsx(s.chip, equipment === eq.key && s.selected)}
              key={eq.key}
              onClick={() => setEquipment(eq.key)}
            >
              {eq.label}
            </button>
          ))}
        </div>
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
                  onClick={() => setWeight({ ...weight, selfWeightPercent: p })}
                >
                  {p}%
                </button>
              ))}
            </div>
          </>
        )}
        <label className={s.label}>Диапазон повторений</label>
        <div className={s.chips}>
          {repsOptions.map((w) => (
            <button
              className={clsx(s.chip, reps === w.key && s.selected)}
              key={w.key}
              onClick={() => setReps(w.key)}
            >
              {w.label}
            </button>
          ))}
        </div>
        <label className={s.label}>Основная группа мышц</label>
        <div className={s.chips}>
          {muscles.map((muscle) => (
            <button
              className={clsx(s.chip, mainMuscle === muscle.key && s.selected)}
              key={muscle.key}
              onClick={() => mainMuscleHandler(muscle.key)}
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
              onClick={() => secondaryMuscleHandler(muscle.key)}
            >
              {muscle.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
