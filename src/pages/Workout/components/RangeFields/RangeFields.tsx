import { clsx } from "clsx";
import { MdClose } from "react-icons/md";
import type { RangeFieldsProps } from "./types.ts";
import s from "./styles.module.scss";

export function RangeFields({
  range,
  invalid,
  onChange,
  onRemove,
}: RangeFieldsProps) {
  const field = (key: "from" | "to" | "step", label: string) => (
    <input
      className={clsx(s.input, invalid && s.invalid)}
      aria-label={label}
      inputMode="decimal"
      value={range[key]}
      onContextMenu={(e) => e.preventDefault()}
      onFocus={(e) => e.target.select()}
      onChange={(e) => onChange({ ...range, [key]: e.target.value })}
    />
  );

  return (
    <div className={s.root}>
      {field("from", "От")}
      <span className={s.text}>–</span>
      {field("to", "До")}
      <span className={s.text}>шаг</span>
      {field("step", "Шаг")}
      {onRemove ? (
        <button className={s.remove} aria-label="Убрать ряд" onClick={onRemove}>
          <MdClose />
        </button>
      ) : (
        <span className={s.remove} />
      )}
    </div>
  );
}
