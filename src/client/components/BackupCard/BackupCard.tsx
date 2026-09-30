import s from "./styles.module.scss";
import { VkButton } from "../VkButton";
import type { BackupCardProps } from "./types.ts";

// The standing reminder that nothing is backed up. It sits where the person
// comes anyway, and never pops up by itself.
export function BackupCard({ muted }: BackupCardProps) {
  return (
    <div className={s.root}>
      <div className={s.label}>Резервной копии нет</div>
      <div className={s.note}>
        Данные хранятся только на телефоне. Войди, чтобы не потерять их при
        смене телефона
      </div>
      <div className={s.action}>
        <VkButton muted={muted} />
      </div>
    </div>
  );
}
