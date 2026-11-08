import type { InventorySectionProps } from "./types.ts";
import s from "./styles.module.scss";

export function InventorySection({
  label,
  hint,
  children,
}: InventorySectionProps) {
  const lines = Array.isArray(hint) ? hint : [hint];

  return (
    <section>
      <div className={s.label}>{label}</div>
      <div className={s.hint}>
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      {children && <div className={s.content}>{children}</div>}
    </section>
  );
}
