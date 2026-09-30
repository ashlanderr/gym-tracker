import s from "./styles.module.scss";
import { useState } from "react";
import { clsx } from "clsx";
import { SiVk } from "react-icons/si";
import { startVkSignIn } from "../../api";
import type { VkButtonProps } from "./types.ts";

// Leaves the app for the system browser; a second tap while it opens would
// only start another sign-in.
export function VkButton({
  label = "Войти через VK ID",
  muted,
}: VkButtonProps) {
  const [starting, setStarting] = useState(false);

  const signIn = () => {
    setStarting(true);
    startVkSignIn().catch((error: unknown) => {
      console.warn(error);
      setStarting(false);
    });
  };

  return (
    <button
      className={clsx(s.root, muted && s.muted)}
      disabled={starting}
      onClick={signIn}
    >
      <SiVk className={s.icon} />
      {label}
    </button>
  );
}
