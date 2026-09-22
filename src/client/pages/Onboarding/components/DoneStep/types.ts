import type { OnboardingDraft } from "../../types.ts";

export interface DoneStepProps {
  draft: OnboardingDraft;
  onFinish: () => void;
}
