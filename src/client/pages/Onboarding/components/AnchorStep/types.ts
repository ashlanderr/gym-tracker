import type { AnchorEntry, AnchorSpec, Sex } from "../../types.ts";

export interface AnchorStepProps {
  anchor: AnchorSpec;
  sex: Sex;
  entry: AnchorEntry | undefined;
  // The reason for asking is spelled out once, on the first lift.
  isFirst: boolean;
  onSubmit: (entry: AnchorEntry) => void;
  onSkip: () => void;
}
