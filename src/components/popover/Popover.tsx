import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import { createPortal } from "react-dom";
import "./popover.scss";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";

export interface PopoverProps {
  /** Trigger element rendered in place; clicking it toggles the popover. */
  children: ReactNode;
  /** Content rendered inside the focus-trapped popover dialog. */
  content: ReactNode;
  /** Preferred placement relative to the trigger. */
  placement?: PopoverPlacement;
  /** Accessible label for the popover dialog. */
  label?: string;
  /** Disabled trigger — never opens and emits no events. */
  disabled?: boolean;
  /** Controlled open state (two-way via `onOpenChange`). */
  open?: boolean;
  /** Default open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Emitted whenever the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Extra class names applied to the host wrapper. */
  className?: string;
}

const GAP = 8;

function focusable(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

/**
 * Toggles a focus-trapped dialog popover anchored to its trigger. Dismisses on
 * outside click or Escape and restores focus to the trigger. React port of the
 * Onyx UI Angular `uiPopover` directive (portal + hand-rolled focus trap, no
 * extra deps).
 */
export function Popover({
  children,
  content,
  placement = "bottom",
  label = "",
  disabled = false,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
}: PopoverProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [coords, setCoords] = useState<CSSProperties>({});
  const dialogId = useId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(() => setOpen(false), [setOpen]);

  const toggle = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      setOpen(!open);
    },
    [disabled, open, setOpen],
  );

  const onTriggerKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpen(!open);
      }
    },
    [disabled, open, setOpen],
  );

  // Position the panel relative to the trigger once it is open.
  useLayoutEffect(() => {
    if (!open) return;
    const anchor = triggerRef.current?.getBoundingClientRect();
    if (!anchor) return;
    const style: CSSProperties = { position: "fixed" };
    switch (placement) {
      case "top":
        style.left = anchor.left;
        style.bottom = window.innerHeight - anchor.top + GAP;
        break;
      case "left":
        style.right = window.innerWidth - anchor.left + GAP;
        style.top = anchor.top;
        break;
      case "right":
        style.left = anchor.right + GAP;
        style.top = anchor.top;
        break;
      case "bottom":
      default:
        style.left = anchor.left;
        style.top = anchor.bottom + GAP;
        break;
    }
    setCoords(style);
  }, [open, placement]);

  // Auto-capture focus into the panel and restore it to the trigger on close.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel) {
      const first = focusable(panel)[0];
      (first ?? panel).focus();
    }
    return () => {
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  // Escape to close + focus trap (Tab cycles within the panel).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = focusable(panel);
      if (items.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, close]);

  const hostClass = ["ui-popover", className ?? ""].filter(Boolean).join(" ");

  // ARIA + interaction live on the trigger element itself (mirrors the Angular
  // `[uiPopover]` directive that sits on a `<button>`). When the child is a
  // valid element we clone onto it so there is a single interactive control —
  // this keeps `aria-expanded`/`aria-haspopup` on a role that allows them and
  // avoids nesting interactive elements. Otherwise we fall back to a wrapper.
  const triggerProps = {
    "aria-haspopup": "dialog" as const,
    "aria-expanded": open,
    "aria-controls": open ? dialogId : undefined,
    onClick: toggle,
    onKeyDown: onTriggerKeyDown,
  };

  const trigger = isValidElement(children) ? (
    cloneElement(children as ReactElement<Record<string, unknown>>, {
      ...triggerProps,
      ref: triggerRef as Ref<HTMLElement>,
    })
  ) : (
    <span
      ref={triggerRef as Ref<HTMLSpanElement>}
      className="ui-popover__trigger"
      role="button"
      tabIndex={disabled ? undefined : 0}
      {...triggerProps}
    >
      {children}
    </span>
  );

  return (
    <span className={hostClass}>
      {trigger}
      {open &&
        createPortal(
          <>
            <div
              className="ui-popover__backdrop"
              onClick={close}
              aria-hidden="true"
            />
            <div
              id={dialogId}
              ref={panelRef}
              className="ui-popover__panel"
              role="dialog"
              tabIndex={-1}
              aria-label={label || undefined}
              style={coords}
            >
              {content}
            </div>
          </>,
          document.body,
        )}
    </span>
  );
}
