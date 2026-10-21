import s from "./styles.module.scss";
import { clsx } from "clsx";
import { MdArrowBack } from "react-icons/md";
import type { HeaderButtonProps, PageHeaderProps } from "./types.ts";

// The top of every page: back on the left, the title in the middle and one
// action on the right. It sticks, so the action stays at hand while scrolling.
export function PageHeader({
  kicker,
  title,
  right,
  children,
  start,
  onBack,
  onTitleClick,
}: PageHeaderProps) {
  return (
    <div className={s.root}>
      <div className={s.row}>
        {onBack ? (
          <HeaderButton onClick={onBack}>
            <MdArrowBack />
          </HeaderButton>
        ) : (
          !start && <div className={s.spacer} />
        )}
        <div
          className={clsx(
            s.titles,
            start && s.start,
            onTitleClick && s.clickable,
          )}
          onClick={onTitleClick}
        >
          {kicker && <div className={s.kicker}>{kicker}</div>}
          <div className={s.title}>{title}</div>
        </div>
        {right ?? <div className={s.spacer} />}
      </div>
      {children}
    </div>
  );
}

export function HeaderButton({
  primary,
  disabled,
  children,
  onClick,
}: HeaderButtonProps) {
  return (
    <button
      className={clsx(s.button, primary ? s.primary : s.icon)}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
