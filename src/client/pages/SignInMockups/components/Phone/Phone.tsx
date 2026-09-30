import s from "./styles.module.scss";
import type { PhoneProps } from "./types.ts";

export function Phone({ caption, note, children, overlay }: PhoneProps) {
  return (
    <figure className={s.root}>
      <div className={s.screen}>
        {children}
        {overlay && <div className={s.overlay}>{overlay}</div>}
      </div>
      <figcaption className={s.caption}>
        {caption}
        {note && <div className={s.note}>{note}</div>}
      </figcaption>
    </figure>
  );
}
