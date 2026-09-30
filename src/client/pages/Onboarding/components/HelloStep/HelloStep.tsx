import { Avatar } from "../../../../components";
import { StepLayout } from "../StepLayout";
import type { HelloStepProps } from "./types.ts";

// Somebody pressed "Войти" without having been here: the sign-in worked, the
// account is just empty, and the questions start from here.
export function HelloStep({ account, onStart }: HelloStepProps) {
  const [firstName] = account.name.split(" ");

  return (
    <StepLayout
      icon={<Avatar name={account.name} image={account.image} />}
      question={`Привет, ${firstName}!`}
      note="Аккаунт пока пустой. Ответь на несколько вопросов, и мы подберём веса для первой тренировки."
      action={{ label: "Дальше", onClick: onStart }}
    />
  );
}
