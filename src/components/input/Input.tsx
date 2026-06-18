import { useId, useState } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import "./input.scss";

export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search";
export type InputSize = "sm" | "md" | "lg";

export interface InputProps {
  /** Native input type. */
  type?: InputType;
  /** Control size. */
  size?: InputSize;
  /** Placeholder text. */
  placeholder?: string;
  /** Visible label — when set, renders a `<label>` linked to the input. */
  label?: string;
  /** Accessible name when no visible label is provided. */
  ariaLabel?: string;
  /** Invalid state — reflected via aria-invalid and styling. */
  invalid?: boolean;
  /** Disabled state — a disabled input never emits `onValueChange`. */
  disabled?: boolean;
  /** Controlled value (two-way via `value` + `onValueChange`). */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Emitted on every value change. */
  onValueChange?: (value: string) => void;
  /** Emitted on blur (mirrors the CVA onTouched contract). */
  onBlurred?: (event: FocusEvent<HTMLInputElement>) => void;
  /** Extra class names applied to the host element. */
  className?: string;
}

const SIZE_CLASS: Record<InputSize, string> = {
  sm: "ui-input--sm",
  md: "",
  lg: "ui-input--lg",
};

/**
 * Text input with label, invalid and disabled states. React port of the Onyx
 * UI Angular `ui-input`. Supports controlled (`value` + `onValueChange`) and
 * uncontrolled (`defaultValue`) usage.
 */
export function Input({
  type = "text",
  size = "md",
  placeholder = "",
  label = "",
  ariaLabel = "",
  invalid = false,
  disabled = false,
  value,
  defaultValue = "",
  onValueChange,
  onBlurred,
  className,
}: InputProps) {
  const inputId = useId();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? value : internalValue;

  const hostClass = [
    "ui-input",
    SIZE_CLASS[size],
    invalid ? "ui-input--invalid" : "",
    disabled ? "ui-input--disabled" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (disabled) return;
    const next = event.target.value;
    if (!isControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
    onBlurred?.(event);
  };

  return (
    <span className={hostClass}>
      {label && (
        <label className="ui-input__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        className="ui-input__el"
        id={inputId}
        type={type}
        value={currentValue}
        disabled={disabled}
        placeholder={placeholder || undefined}
        aria-label={!label && ariaLabel ? ariaLabel : undefined}
        aria-invalid={invalid ? "true" : undefined}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </span>
  );
}
