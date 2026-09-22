import { MdOutlineFitnessCenter } from "react-icons/md";
import { QUESTIONS } from "../../questions.ts";
import { StepLayout } from "../StepLayout";
import type { WelcomeStepProps } from "./types.ts";

// The first screen sells the questions rather than asking one: it says what
// the app does with the answers and that they are not final.
export function WelcomeStep({ onStart, onSkip }: WelcomeStepProps) {
  return (
    <StepLayout
      icon={<MdOutlineFitnessCenter />}
      {...QUESTIONS.welcome}
      action={{ label: "Начать", onClick: onStart }}
      secondary={{ label: "Пропустить", onClick: onSkip }}
    />
  );
}
