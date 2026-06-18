import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import "./dialog.scss";

export type DialogSize = "sm" | "md" | "lg";

const SIZE_CLASS: Record<DialogSize, string> = {
  sm: "ui-dialog__panel--sm",
  md: "",
  lg: "ui-dialog__panel--lg",
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export interface DialogProps {
  /** Open state. Two-way bindable via `open` + `onOpenChange`. */
  open: boolean;
  /** Called when the dialog requests a state change (Esc / backdrop / close). */
  onOpenChange?: (open: boolean) => void;
  /** Heading text; labels the dialog via `aria-labelledby`. */
  heading?: string;
  /** Accessible name used when no `heading` is provided. */
  ariaLabel?: string;
  /** Accessible name for the close button. */
  closeLabel?: string;
  /** Whether pressing Esc closes the dialog. */
  closeOnEsc?: boolean;
  /** Whether clicking the backdrop closes the dialog. */
  closeOnBackdrop?: boolean;
  /** Panel size. */
  size?: DialogSize;
  /** Emitted after the dialog is attached. */
  onOpened?: () => void;
  /** Emitted after the dialog is detached. */
  onClosed?: () => void;
  /** Main body content (the default slot / `<ng-content />`). */
  children?: ReactNode;
  /** Footer content (the `[uiDialogFooter]` named slot). */
  footer?: ReactNode;
}

/**
 * Modal dialog. React port of the Onyx UI Angular `ui-dialog`. Rendering and
 * positioning use `createPortal`; the focus trap, initial focus capture and
 * focus restoration are hand-rolled (no CDK / no extra deps). Exposes
 * role=dialog with aria-modal, closes on Esc and backdrop click.
 */
export function Dialog({
  open,
  onOpenChange,
  heading = "",
  ariaLabel = "",
  closeLabel = "Close",
  closeOnEsc = true,
  closeOnBackdrop = true,
  size = "md",
  onOpened,
  onClosed,
  children,
  footer,
}: DialogProps) {
  const headingId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  // Track whether onOpened/onClosed have fired, mirroring CDK attach/detach.
  const wasOpen = useRef(false);

  const close = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  // Capture initial focus on open; restore focus to the trigger on close.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      // Focus the panel (cdkFocusInitial -> panel has tabindex=-1) after paint.
      const id = requestAnimationFrame(() => {
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = panel.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR,
        );
        (focusables[0] ?? panel).focus();
      });
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [open]);

  // Fire opened/closed lifecycle outputs on attach/detach transitions.
  useEffect(() => {
    if (open && !wasOpen.current) {
      wasOpen.current = true;
      onOpened?.();
    } else if (!open && wasOpen.current) {
      wasOpen.current = false;
      previouslyFocused.current?.focus?.();
      previouslyFocused.current = null;
      onClosed?.();
    }
  }, [open, onOpened, onClosed]);

  // Block body scroll while open (parity with CDK's blocking scroll strategy).
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Esc handling at the document level — mirrors CDK's overlay keydownEvents,
  // which fire regardless of where focus currently sits. Relying on React's
  // synthetic onKeyDown bubbling from the focused element is unreliable: before
  // the initial-focus rAF runs, the active element is still the body (outside
  // the portal), so Escape would never reach the dialog.
  useEffect(() => {
    if (!open || !closeOnEsc) return undefined;
    const onDocKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onDocKeyDown);
    return () => document.removeEventListener("keydown", onDocKeyDown);
  }, [open, closeOnEsc, close]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== "Tab") return;

    // Hand-rolled focus trap: cycle focus within the panel.
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (focusables.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleBackdropMouseDown = (
    event: ReactMouseEvent<HTMLDivElement>,
  ): void => {
    // Only the backdrop itself (not the panel) triggers a backdrop close.
    if (event.target === event.currentTarget && closeOnBackdrop) {
      close();
    }
  };

  if (!open || typeof document === "undefined") {
    return null;
  }

  const panelClass = ["ui-dialog__panel", SIZE_CLASS[size]]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div className="ui-dialog" onKeyDown={handleKeyDown}>
      <div
        className="ui-dialog__backdrop"
        onMouseDown={handleBackdropMouseDown}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={panelClass}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby={heading ? headingId : undefined}
        aria-label={!heading ? ariaLabel || undefined : undefined}
      >
        <div className="ui-dialog__header">
          {heading && (
            <h2 className="ui-dialog__title" id={headingId}>
              {heading}
            </h2>
          )}
          <button
            type="button"
            className="ui-dialog__close"
            aria-label={closeLabel}
            onClick={close}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className="ui-dialog__body">{children}</div>

        {footer != null && <div className="ui-dialog__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
