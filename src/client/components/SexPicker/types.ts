import type { Sex } from "../../db";

export interface SexPickerProps {
  value: Sex | undefined;
  // Sets the height the figures fill: the row itself has none of its own.
  className?: string;
  onSelect: (value: Sex) => void;
}
