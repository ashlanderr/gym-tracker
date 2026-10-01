import s from "./styles.module.scss";
import type { PhoneProps } from "./types.ts";

export function Phone({ caption, note, children, overlay, size }: PhoneProps) {
  return (
    <figure className={s.root} style={size && { width: size.width }}>
      <div
        className={s.screen}
        style={size && { aspectRatio: `${size.width} / ${size.height}` }}
      >
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
