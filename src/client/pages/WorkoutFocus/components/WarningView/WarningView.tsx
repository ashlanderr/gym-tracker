import s from "./styles.module.scss";
import { MdWarningAmber } from "react-icons/md";
import { SetupLayout } from "../SetupLayout";
import type { WarningViewProps } from "./types.ts";

// The weight leads, since it is what the warning is about; with nothing
// added to the body there is no number worth showing, and the reason is the
// body weight itself. Each sentence keeps a line of its own, so a short first
// one never pulls the start of the second one up.
export function WarningView({
  exercise,
  minimum,
  onReplace,
  onKeep,
}: WarningViewProps) {
  const isBodyOnly = exercise.load.type === "none";

  return (
    <SetupLayout
      name={exercise.name}
      actions={[
        { label: "Заменить", isPrimary: true, onClick: onReplace },
        { label: "Оставить", onClick: onKeep },
      ]}
    >
      <div className={s.warning}>
        {isBodyOnly ? (
          <span className={s.sign}>
            <MdWarningAmber />
          </span>
        ) : (
          <div className={s.weight}>
            {minimum.value}
            <span className={s.units}>{minimum.units}</span>
          </div>
        )}
        <div className={s.title}>Может быть тяжело</div>
        <div className={s.text}>
          <p>
            {isBodyOnly
              ? "Здесь поднимаешь весь свой вес."
              : "Меньше здесь не поставить."}
          </p>
          <p>Если ты только начинаешь, лучше заменить упражнение.</p>
        </div>
      </div>
    </SetupLayout>
  );
}
