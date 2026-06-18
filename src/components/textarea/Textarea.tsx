import { useEffect, useId, useState, type ChangeEvent, type FocusEvent } from "react";
import "./textarea.scss";

export interface TextareaProps {
  /** Number of visible text rows. */
  rows?: number;
  /** Placeholder text. */
  placeholder?: string;
  /** Visible label — when set, renders a `<label>` linked to the control. */
  label?: string;
  /** Accessible name when no visible label is provided. */
  ariaLabel?: string;
  /** Invalid state — reflected via aria-invalid and styling. */
  invalid?: boolean;
  /** Disabled state — a disabled textarea never emits `onValueChange`. */
  disabled?: boolean;
  /** Controlled value (two-way via `value` + `onValueChange`). */
  value?: string;
  /** Emitted on every value change. */
  onValueChange?: (value: string) => void;
  /** Emitted on blur (mirrors the CVA touched contract). */
  onBlurred?: () => void;
  /** Extra class names applied to the host element. */
  className?: string;
}

/**
 * Multi-line text input with rows, invalid and disabled states. React port of
 * the Onyx UI Angular `ui-textarea` (which implements ControlValueAccessor).
 */
export function Textarea({
  rows = 3,
  placeholder = "",
  label = "",
  ariaLabel = "",
  invalid = false,
  disabled = false,
  value = "",
  onValueChange,
  onBlurred,
  className,
}: TextareaProps) {
  const inputId = useId();

  // Mirror the Angular component's internal `value` signal: keep local state so
  // the control tracks typed input even when the parent does not feed `value`
  // back in. When used as a controlled component, sync local state on changes.
  const [internalValue, setInternalValue] = useState(value);
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const hostClass = [
    "ui-textarea",
    invalid ? "ui-textarea--invalid" : "",
    disabled ? "ui-textarea--disabled" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    if (disabled) return;
    const next = event.target.value;
    setInternalValue(next);
    onValueChange?.(next);
  };

  const handleBlur = (_event: FocusEvent<HTMLTextAreaElement>): void => {
    onBlurred?.();
  };

  return (
    <span className={hostClass}>
      {label ? (
        <label className="ui-textarea__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <textarea
        className="ui-textarea__el"
        id={inputId}
        rows={rows}
        value={internalValue}
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
