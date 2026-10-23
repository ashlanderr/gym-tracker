import type { MeasurementType } from "../../../../db";

export interface GirthCell {
  type: MeasurementType;
  label: string;
  value: string;
  change: string | null;
}

export interface GirthsCardProps {
  label: string;
  meta: string;
  cells: GirthCell[];
  onOpen: (type: MeasurementType) => void;
  onAdd: () => void;
}
