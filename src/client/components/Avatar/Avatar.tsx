import s from "./styles.module.scss";
import { clsx } from "clsx";
import type { AvatarProps } from "./types.ts";

// The VK photo when there is one, the first letter of the name otherwise.
export function Avatar({ name, image, size = "large" }: AvatarProps) {
  return (
    <div className={clsx(s.root, s[size])}>
      {image ? <img className={s.image} src={image} alt="" /> : name.charAt(0)}
    </div>
  );
}
