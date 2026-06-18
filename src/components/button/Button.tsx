import type { MouseEvent, ReactNode } from "react";
import "./button.scss";

export type ButtonVariant = "primary" | "secondary" | "text";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonType = "button" | "submit" | "reset";

export interface ButtonProps {
  /** Visual variant. */
  variant?: ButtonVariant;
  /** Control size. */
  size?: ButtonSize;
  /** Native button type. */
  type?: ButtonType;
  /** Disabled state — a disabled button never emits `onClicked`. */
  disabled?: boolean;
  /** Loading state — shows a spinner and suppresses interaction. */
  loading?: boolean;
  /** Emitted on activation (pointer or keyboard) when interactive. */
  onClicked?: (event: MouseEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
  /** Extra class names applied to the host element. */
  className?: string;
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "ui-button--sm",
  md: "",
  lg: "ui-button--lg",
};

/**
 * Action trigger with primary, secondary and text variants, plus disabled and
 * loading states. React port of the Onyx UI Angular `ui-button`.
 */
export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  onClicked,
  children,
  className,
}: ButtonProps) {
  const interactive = !disabled && !loading;

  const hostClass = [
    "ui-button",
    `ui-button--${variant}`,
    SIZE_CLASS[size],
    loading ? "ui-button--loading" : "",
    disabled ? "ui-button--disabled" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (!interactive) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClicked?.(event);
  };

  return (
    <span className={hostClass}>
      <button
        className="ui-button__el"
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        onClick={handleClick}
      >
        {loading && <span className="ui-button__spinner" aria-hidden="true" />}
        <span className="ui-button__label">{children}</span>
      </button>
    </span>
  );
}
