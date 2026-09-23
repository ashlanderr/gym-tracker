import s from "./styles.module.scss";
import { useState } from "react";
import { ExerciseCrossFade, SetPicker, useStore } from "../../../../components";
import { useQueryExerciseById } from "../../../../db";
import { DEFAULT_ANCHOR_REPS, REPS_RANGE } from "../../constants.ts";
import { QUESTIONS } from "../../questions.ts";
import { anchorWeightUnits, formatAnchorWeight } from "../../utils.ts";
import { StepLayout } from "../StepLayout";
import type { AnchorStepProps } from "./types.ts";

// One lift per screen: with a picture and a picker there is nothing left
// over for a list, and the picture is what tells somebody whether this is
// the movement they are remembering.
export function AnchorStep({
  anchor,
  sex,
  entry,
  isFirst,
  onSubmit,
  onSkip,
}: AnchorStepProps) {
  const store = useStore();
  const exercise = useQueryExerciseById(store, anchor.exercise);
  const [weightKg, setWeightKg] = useState(
    () => entry?.weightKg ?? anchor.start[sex],
  );
  const [reps, setReps] = useState(() => entry?.reps ?? DEFAULT_ANCHOR_REPS);

  if (!exercise) return null;

  return (
    <StepLayout
      question={exercise.name}
      note={
        anchor.id === "pullup" ? QUESTIONS.pullup.note : QUESTIONS.anchor.note
      }
      why={isFirst ? QUESTIONS.anchor.why : undefined}
      action={{ label: "Дальше", onClick: () => onSubmit({ weightKg, reps }) }}
      secondary={{ label: "Не помню", onClick: onSkip }}
    >
      <div className={s.root}>
        {exercise.asset?.type === "cross-fade" && (
          <ExerciseCrossFade
            className={s.art}
            startUrl={exercise.asset.startUrl}
            endUrl={exercise.asset.endUrl}
          />
        )}
        <SetPicker
          weightRange={anchor.weight}
          repsRange={REPS_RANGE}
          weight={weightKg}
          reps={reps}
          weightUnits={anchorWeightUnits(anchor.id)}
          formatWeight={(value) => formatAnchorWeight(anchor.id, value)}
          onWeightChange={setWeightKg}
          onRepsChange={setReps}
        />
      </div>
    </StepLayout>
  );
}
