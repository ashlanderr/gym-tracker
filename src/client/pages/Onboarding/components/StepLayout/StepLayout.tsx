import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useModalStack } from "../../../../components";
import { WhySheet, WhyToggle } from "../WhyNote";
import type { StepLayoutProps } from "./types.ts";

// Every step is the same three things: what we ask, why we ask it, and one
// way to answer. The footer is kept out of the scrolling middle so the button
// never moves when a step is taller than the screen.
export function StepLayout({
  icon,
  question,
  note,
  why,
  text,
  children,
  action,
  secondary,
}: StepLayoutProps) {
  const { pushModal } = useModalStack();

  return (
    <>
      {/* A question holds its place at the top while the answer sits in the
          middle of what is left; a screen that states something instead of
          asking — the two with an icon — is centred as one block. */}
      <div className={clsx(s.stage, children && !icon && s.withBody)}>
        {icon && <div className={s.icon}>{icon}</div>}
        <h1 className={s.question}>{question}</h1>
        {note && <div className={s.note}>{note}</div>}
        {why && <WhyToggle onOpen={() => pushModal(WhySheet, why)} />}
        {/* Two bands of equal weight hold the answer in the middle of what
            the question leaves. Both are empty: the answer is what grows. */}
        <div className={s.gap} />
        {text && <div className={s.text}>{text}</div>}
        {children && <div className={s.body}>{children}</div>}
        <div className={s.tail} />
      </div>
      <div className={s.action}>
        {action && (
          <button
            className={s.primary}
            disabled={action.disabled}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
        {secondary && (
          <button className={s.secondary} onClick={secondary.onClick}>
            {secondary.label}
          </button>
        )}
      </div>
    </>
  );
}
