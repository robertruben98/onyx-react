import { useId, useState, type ChangeEvent } from "react";
import "./switch.scss";

export interface SwitchProps {
  /** Visible label — when set, renders alongside the control. */
  label?: string;
  /** Accessible name when no visible label is provided. */
  ariaLabel?: string;
  /** Invalid state — reflected via aria-invalid and styling. */
  invalid?: boolean;
  /** Disabled state — a disabled switch never emits `onCheckedChange`. */
  disabled?: boolean;
  /** Controlled checked value (two-way: pair with `onCheckedChange`). */
  checked?: boolean;
  /** Initial checked value for uncontrolled usage. */
  defaultChecked?: boolean;
  /** Emitted on every change. */
  onCheckedChange?: (checked: boolean) => void;
  /** Called on blur (touched contract parity). */
  onBlur?: () => void;
  /** Extra class names applied to the host element. */
  className?: string;
}

/**
 * Boolean toggle with role=switch. React port of the Onyx UI Angular
 * `ui-switch`. Supports controlled (`checked` + `onCheckedChange`) and
 * uncontrolled (`defaultChecked`) usage.
 */
export function Switch({
  label = "",
  ariaLabel = "",
  invalid = false,
  disabled = false,
  checked,
  defaultChecked = false,
  onCheckedChange,
  onBlur,
  className,
}: SwitchProps) {
  const inputId = useId();
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? checked : internalChecked;

  const hostClass = [
    "ui-switch",
    invalid ? "ui-switch--invalid" : "",
    disabled ? "ui-switch--disabled" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (disabled) {
      return;
    }
    const value = event.target.checked;
    if (!isControlled) {
      setInternalChecked(value);
    }
    onCheckedChange?.(value);
  };

  return (
    <span className={hostClass}>
      <label className="ui-switch__wrap" htmlFor={inputId}>
        <span className="ui-switch__control">
          <input
            className="ui-switch__el"
            type="checkbox"
            role="switch"
            id={inputId}
            checked={isChecked}
            disabled={disabled}
            aria-label={!label && ariaLabel ? ariaLabel : undefined}
            aria-invalid={invalid ? "true" : undefined}
            onChange={handleChange}
            onBlur={onBlur}
          />
          <span className="ui-switch__track" aria-hidden="true" />
        </span>
        {label && <span className="ui-switch__label">{label}</span>}
      </label>
    </span>
  );
}
