import { useId, useState, type ChangeEvent } from "react";
import "./radio-group.scss";

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Options to render. */
  options: RadioOption[];
  /** Visible group label — rendered as a `<legend>`. */
  label?: string;
  /** Accessible name when no visible label is provided. */
  ariaLabel?: string;
  /** Invalid state — reflected via aria-invalid and styling. */
  invalid?: boolean;
  /** Disables the whole group. A disabled group never emits `onValueChange`. */
  disabled?: boolean;
  /** Controlled selected value (two-way via `value` + `onValueChange`). */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Emitted on every selection change. */
  onValueChange?: (value: string) => void;
  /** Extra class names applied to the host element. */
  className?: string;
}

/**
 * Single-choice group of native radios with roving focus and arrow-key
 * navigation (provided by the browser via a shared `name`). React port of the
 * Onyx UI Angular `ui-radio-group`.
 */
export function RadioGroup({
  options,
  label = "",
  ariaLabel = "",
  invalid = false,
  disabled = false,
  value,
  defaultValue = "",
  onValueChange,
  className,
}: RadioGroupProps) {
  const name = useId();
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const selected = isControlled ? value : internal;

  const hostClass = [
    "ui-radio-group",
    invalid ? "ui-radio-group--invalid" : "",
    disabled ? "ui-radio-group--disabled" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (disabled) {
      return;
    }
    const next = event.target.value;
    if (!isControlled) {
      setInternal(next);
    }
    onValueChange?.(next);
  };

  return (
    <span className={hostClass}>
      <fieldset
        className="ui-radio-group__fieldset"
        role="radiogroup"
        aria-label={!label && ariaLabel ? ariaLabel : undefined}
        aria-invalid={invalid ? "true" : undefined}
      >
        {label && <legend className="ui-radio-group__legend">{label}</legend>}
        {options.map((opt) => (
          <label className="ui-radio" key={opt.value}>
            <input
              className="ui-radio__el"
              type="radio"
              name={name}
              value={opt.value}
              checked={selected === opt.value}
              disabled={disabled || !!opt.disabled}
              onChange={handleChange}
            />
            <span className="ui-radio__label">{opt.label}</span>
          </label>
        ))}
      </fieldset>
    </span>
  );
}
