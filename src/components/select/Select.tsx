import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { createPortal } from "react-dom";
import "./select.scss";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Available options ({ value, label, disabled? }). */
  options?: SelectOption[];
  /** Placeholder shown when nothing is selected. */
  placeholder?: string;
  /** Disabled state — a disabled control never opens or emits. */
  disabled?: boolean;
  /** Accessible name for the combobox (falls back to the placeholder). */
  ariaLabel?: string;
  /** Selected value (controlled two-way model). */
  value?: string | null;
  /** Initial value for uncontrolled usage. */
  defaultValue?: string | null;
  /** Emitted when the selected value changes. */
  onChange?: (value: string) => void;
  /** Emitted when the control is blurred / closed (ControlValueAccessor touch). */
  onTouched?: () => void;
  /** Extra class names applied to the host element. */
  className?: string;
}

/** First enabled option index walking `step` from `from`, wrapping. */
function nextEnabled(opts: SelectOption[], from: number, step: number): number {
  const n = opts.length;
  if (!n) return -1;
  for (let k = 1; k <= n; k++) {
    const i = (((from + step * k) % n) + n) % n;
    if (!opts[i].disabled) return i;
  }
  return from;
}

/**
 * Single-select dropdown. Trigger is a `role=combobox`; the panel is a
 * `role=listbox` rendered through a portal with full keyboard support and
 * `aria-activedescendant`. React port of the Onyx UI Angular `ui-select`.
 */
export function Select({
  options = [],
  placeholder = "Select…",
  disabled = false,
  ariaLabel = "",
  value: valueProp,
  defaultValue = null,
  onChange,
  onTouched,
  className,
}: SelectProps) {
  const uid = useId();
  const listboxId = `ui-select-listbox-${uid}`;
  const optionId = useCallback(
    (index: number) => `ui-select-option-${uid}-${index}`,
    [uid],
  );

  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue,
  );
  const value = isControlled ? (valueProp ?? null) : internalValue;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? "",
    [options, value],
  );
  const activeId = activeIndex >= 0 ? optionId(activeIndex) : undefined;

  const positionPanel = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setCoords({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    onTouched?.();
    triggerRef.current?.focus();
  }, [onTouched]);

  const openPanel = useCallback(() => {
    positionPanel();
    const selected = options.findIndex((o) => o.value === value);
    setActiveIndex(selected >= 0 ? selected : nextEnabled(options, -1, 1));
    setOpen(true);
  }, [options, positionPanel, value]);

  const toggle = useCallback(() => {
    if (disabled) return;
    if (open) close();
    else openPanel();
  }, [close, disabled, open, openPanel]);

  const selectOption = useCallback(
    (index: number) => {
      const opt = options[index];
      if (!opt || opt.disabled) return;
      if (!isControlled) setInternalValue(opt.value);
      onChange?.(opt.value);
      close();
    },
    [close, isControlled, onChange, options],
  );

  // Move focus into the listbox once it is open and reposition on scroll/resize.
  useLayoutEffect(() => {
    if (!open) return;
    listboxRef.current?.focus();
    const reposition = () => positionPanel();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, positionPanel]);

  // Keep the active descendant scrolled into view.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const node = document.getElementById(optionId(activeIndex));
    node?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, open, optionId]);

  const onTriggerKeydown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (disabled) return;
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (!open) openPanel();
    }
  };

  const onListboxKeydown = (event: KeyboardEvent<HTMLUListElement>): void => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => nextEnabled(options, i, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => nextEnabled(options, i, -1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(nextEnabled(options, -1, 1));
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(nextEnabled(options, options.length, -1));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        selectOption(activeIndex);
        break;
      case "Escape":
      case "Tab":
        close();
        break;
    }
  };

  const hostClass = ["ui-select", className ?? ""].filter(Boolean).join(" ");

  const panel =
    open && coords
      ? createPortal(
          <>
            <div
              className="ui-select__backdrop"
              style={BACKDROP_STYLE}
              onClick={close}
            />
            <div
              className="ui-select__pane"
              style={{
                position: "absolute",
                top: coords.top,
                left: coords.left,
                width: coords.width,
                zIndex: 1000,
              }}
            >
              <ul
                ref={listboxRef}
                role="listbox"
                id={listboxId}
                className="ui-select__listbox"
                tabIndex={-1}
                aria-activedescendant={activeId}
                onKeyDown={onListboxKeydown}
              >
                {options.map((opt, i) => (
                  <li
                    key={opt.value}
                    role="option"
                    id={optionId(i)}
                    className={[
                      "ui-select__option",
                      i === activeIndex ? "ui-select__option--active" : "",
                      opt.value === value
                        ? "ui-select__option--selected"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-selected={opt.value === value}
                    aria-disabled={opt.disabled || undefined}
                    onClick={() => selectOption(i)}
                    onMouseDown={(e: MouseEvent) => e.preventDefault()}
                    onMouseEnter={() => {
                      if (!opt.disabled) setActiveIndex(i);
                    }}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <span className={hostClass}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        className={[
          "ui-select__trigger",
          open ? "ui-select__trigger--open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel || placeholder}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={onTriggerKeydown}
      >
        <span
          className={[
            "ui-select__value",
            !selectedLabel ? "ui-select__value--placeholder" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {selectedLabel || placeholder}
        </span>
        <span className="ui-select__arrow" aria-hidden="true">
          ▾
        </span>
      </button>
      {panel}
    </span>
  );
}

const BACKDROP_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 999,
};
