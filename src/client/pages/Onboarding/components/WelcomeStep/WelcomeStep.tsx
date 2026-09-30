import s from "./styles.module.scss";
import logo from "../../../../../../pwa-assets/logo.svg";
import { startVkSignIn } from "../../../../api";
import type { WelcomeStepProps } from "./types.ts";

// What the app is, and a way back in for somebody who has been here before.
// Most people are new, so they get the one button; the sign-in is a link.
export function WelcomeStep({ onStart }: WelcomeStepProps) {
  const signIn = () => {
    startVkSignIn().catch((error: unknown) => console.warn(error));
  };

  return (
    <div className={s.root}>
      <div className={s.brand}>
        <img className={s.logo} src={logo} alt="" />
        <h1 className={s.name}>Октус</h1>
        <div className={s.tagline}>
          Дневник тренировок, который сам подбирает веса
        </div>
      </div>
      <div className={s.actions}>
        <button className={s.start} onClick={onStart}>
          Начать
        </button>
        <button className={s.signIn} onClick={signIn}>
          Уже есть аккаунт? <b>Войти</b>
        </button>
      </div>
    </div>
  );
}
