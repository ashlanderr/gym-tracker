import { type ModalProps, PageModal } from "../../../../components";
import type { PerformanceWeights } from "../../../../db";
import { WeightsSelector } from "../WeightsSelector";
import type { WeightsSelectorModalData } from "./types.ts";

export function WeightsSelectorModal({
  data,
  onCancel,
  onSubmit,
}: ModalProps<WeightsSelectorModalData, PerformanceWeights>) {
  return (
    <PageModal>
      <WeightsSelector
        equipment={data.equipment}
        weights={data.weights}
        previewKg={data.previewKg}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </PageModal>
  );
}
