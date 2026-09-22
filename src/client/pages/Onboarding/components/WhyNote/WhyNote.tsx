import s from "./styles.module.scss";
import { BottomSheet, type ModalProps } from "../../../../components";
import type { WhyToggleProps } from "./types.ts";

// Onboarding has to explain itself — answers about the body are not
// obviously anyone's business. One line stays visible under the question and
// the argument waits behind a tap.
//
// It opens in a sheet rather than in place: the answer below it is sized to
// the screen, so text unfolding above would squeeze the picture on a lift
// step every time somebody was curious.
export function WhyToggle({ onOpen }: WhyToggleProps) {
  return (
    <button className={s.toggle} onClick={onOpen}>
      Зачем это?
    </button>
  );
}

export function WhySheet({ data, onCancel }: ModalProps<string, null>) {
  return (
    <BottomSheet onClose={onCancel}>
      <div className={s.sheet}>
        <div className={s.grip} />
        <div className={s.title}>Зачем это</div>
        <div className={s.text}>{data}</div>
        <button className={s.close} onClick={onCancel}>
          Понятно
        </button>
      </div>
    </BottomSheet>
  );
}
