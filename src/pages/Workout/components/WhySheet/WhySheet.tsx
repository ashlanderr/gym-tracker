import s from "./styles.module.scss";
import { BottomSheet, type ModalProps } from "../../../../components";

export function WhySheet({ data, onCancel }: ModalProps<string[], null>) {
  return (
    <BottomSheet onClose={onCancel}>
      <div className={s.sheet}>
        <div className={s.grip} />
        <div className={s.title}>Зачем это</div>
        <div className={s.text}>
          {data.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <button className={s.close} onClick={onCancel}>
          Понятно
        </button>
      </div>
    </BottomSheet>
  );
}
