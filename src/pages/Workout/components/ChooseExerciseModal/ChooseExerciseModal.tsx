import { type ModalProps, PageModal } from "../../../../components";
import type { Exercise } from "../../../../db";
import { ChooseExercise } from "../ChooseExercise";

export function ChooseExerciseModal({
  onCancel,
  onSubmit,
}: ModalProps<null, Exercise>) {
  return (
    <PageModal>
      <ChooseExercise onCancel={onCancel} onSubmit={onSubmit} />
    </PageModal>
  );
}
