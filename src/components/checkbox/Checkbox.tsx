import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import "./checkbox.scss";

export type CheckboxSize = "sm" | "md" | "lg";

export interface CheckboxProps {
  /** Control size. */
  size?: CheckboxSize;
  /** Visible label — when set, renders inside the wrapping `<label>`. */
  label?: string;
  /** Accessible name when no visible label is provided. */
  ariaLabel?: string;
  /** Indeterminate (tri-state) — visual dash, not a checked value. */
  indeterminate?: boolean;
  /** Invalid state — reflected via aria-invalid and styling. */
  invalid?: boolean;
  /** Disabled state — a disabled checkbox never emits `onCheckedChange`. */
  disabled?: boolean;
  /** Tab order of the native control (set to -1 inside roving-tabindex grids). */
  tabIndex?: number;
  /** Controlled checked value (two-way via `checked` + `onCheckedChange`). */
  checked?: boolean;
  /** Initial checked value for uncontrolled usage. */
  defaultChecked?: boolean;
  /** Emitted on every change. */
  onCheckedChange?: (value: boolean) => void;
  /** Emitted when the control loses focus (touched contract). */
  onBlurred?: () => void;
  /** Extra class names applied to the host element. */
  className?: string;
}

const SIZE_CLASS: Record<CheckboxSize, string> = {
  sm: "ui-checkbox--sm",
  md: "",
  lg: "ui-checkbox--lg",
};

/**
 * Boolean checkbox with indeterminate, invalid and disabled states. React port
 * of the Onyx UI Angular `ui-checkbox`. Supports both controlled (`checked` +
 * `onCheckedChange`) and uncontrolled (`defaultChecked`) usage.
 */
export function Checkbox({
  size = "md",
  label = "",
  ariaLabel = "",
  indeterminate = false,
  invalid = false,
  disabled = false,
  tabIndex = 0,
  checked,
  defaultChecked = false,
  onCheckedChange,
  onBlurred,
  className,
}: CheckboxProps) {
  const inputId = useId();
  const box = useRef<HTMLInputElement>(null);

  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const currentChecked = isControlled ? checked : internalChecked;

  // `indeterminate` is a DOM property, not an attribute — sync it imperatively.
  useEffect(() => {
    const el = box.current;
    if (el) {
      el.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const hostClass = [
    "ui-checkbox",
    SIZE_CLASS[size],
    invalid ? "ui-checkbox--invalid" : "",
    disabled ? "ui-checkbox--disabled" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (disabled) return;
    const value = event.target.checked;
    if (!isControlled) {
      setInternalChecked(value);
    }
    onCheckedChange?.(value);
  };

  const handleBlur = (_event: FocusEvent<HTMLInputElement>): void => {
    onBlurred?.();
  };

  return (
    <span className={hostClass}>
      <label className="ui-checkbox__wrap" htmlFor={inputId}>
        <input
          ref={box}
          className="ui-checkbox__el"
          type="checkbox"
          id={inputId}
          tabIndex={tabIndex}
          checked={currentChecked}
          disabled={disabled}
          aria-label={!label && ariaLabel ? ariaLabel : undefined}
          aria-invalid={invalid ? "true" : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {label && <span className="ui-checkbox__label">{label}</span>}
      </label>
    </span>
  );
}
