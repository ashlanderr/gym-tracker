import { useState } from "react";
import {
  FormSheet,
  type ModalProps,
  SetPicker,
  useStore,
} from "../../../../components";
import {
  type AnchorId,
  useQueryExerciseById,
  useQueryProfile,
} from "../../../../db";
import { ANCHOR_EXERCISES, changeAnchorSet } from "../../../../domain";
import {
  ANCHORS,
  DEFAULT_ANCHOR_REPS,
  REPS_RANGE,
} from "../../../Onboarding/constants.ts";
import { QUESTIONS } from "../../../Onboarding/questions.ts";
import {
  anchorWeightUnits,
  formatAnchorWeight,
} from "../../../Onboarding/utils.ts";

// The onboarding step again, in a sheet: the same working set rather than a
// one-rep max, opening on the saved answer or on the step's own default.
// There is no picture — a sheet has no room for one, and the name was the
// thing just tapped.
export function AnchorSheet({
  data: id,
  onCancel,
}: ModalProps<AnchorId, null>) {
  const store = useStore();
  const profile = useQueryProfile(store);
  const exercise = useQueryExerciseById(store, ANCHOR_EXERCISES[id]);
  const anchor = ANCHORS.find((a) => a.id === id)!;
  const answered = profile?.anchors[id];
  const [weight, setWeight] = useState(
    () => answered?.weight ?? anchor.start[profile?.sex ?? "male"],
  );
  const [reps, setReps] = useState(() => answered?.reps ?? DEFAULT_ANCHOR_REPS);

  if (!profile || !exercise) return null;

  const saveHandler = () => {
    changeAnchorSet(store, id, { weight, reps });
    void onCancel();
  };

  const forgetHandler = () => {
    changeAnchorSet(store, id, null);
    void onCancel();
  };

  return (
    <FormSheet
      title={exercise.name}
      note={id === "pullup" ? QUESTIONS.pullup.note : QUESTIONS.anchor.note}
      action={{ label: "Сохранить", onClick: saveHandler }}
      secondary={
        answered ? { label: "Не помню", onClick: forgetHandler } : undefined
      }
      onClose={onCancel}
    >
      <SetPicker
        weightRange={anchor.weight}
        repsRange={REPS_RANGE}
        weight={weight}
        reps={reps}
        weightUnits={anchorWeightUnits(id)}
        formatWeight={(value) => formatAnchorWeight(id, value)}
        onWeightChange={setWeight}
        onRepsChange={setReps}
      />
    </FormSheet>
  );
}
