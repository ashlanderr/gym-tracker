import { type ModalProps, PageModal } from "../../../../components";
import { WeightsSelector } from "../WeightsSelector";
import type {
  WeightsSelectorModalData,
  WeightsSelectorModalResult,
} from "./types.ts";

export function WeightsSelectorModal({
  data,
  onCancel,
  onSubmit,
}: ModalProps<WeightsSelectorModalData, WeightsSelectorModalResult>) {
  return (
    <PageModal>
      <WeightsSelector
        equipment={data.equipment}
        weights={data.weights}
        previewKg={data.previewKg}
        onCancel={onCancel}
        onSubmit={(weights) => onSubmit({ weights })}
      />
    </PageModal>
  );
}
