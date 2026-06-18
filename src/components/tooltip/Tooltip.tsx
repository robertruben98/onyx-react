import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type {
  CSSProperties,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import "./tooltip.scss";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** Tooltip text. */
  text: string;
  /** Preferred placement. */
  placement?: TooltipPlacement;
  /** Trigger element the tooltip describes; rendered in place. */
  children: ReactNode;
  /** Extra class names applied to the host wrapper. */
  className?: string;
}

const GAP = 8;

/**
 * Shows a positioned tooltip on hover/focus, hides on leave/blur/Escape, and
 * wires `aria-describedby` from the trigger to the floating surface. React port
 * of the Onyx UI Angular `uiTooltip` directive (portal positioning, no extra
 * deps).
 */
export function Tooltip({
  text,
  placement = "top",
  children,
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [coords, setCoords] = useState<CSSProperties>({});
  const tooltipId = useId();

  const show = useCallback(() => {
    if (!text) return;
    setOpen(true);
  }, [text]);

  const hide = useCallback(() => setOpen(false), []);

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLSpanElement>) => {
      if (event.key === "Escape") hide();
    },
    [hide],
  );

  const onBlur = useCallback(
    (event: ReactFocusEvent<HTMLSpanElement>) => {
      // Hide only when focus leaves the trigger subtree entirely.
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        hide();
      }
    },
    [hide],
  );

  // Position the tooltip relative to the trigger once it is open.
  useLayoutEffect(() => {
    if (!open) return;
    const anchor = triggerRef.current?.getBoundingClientRect();
    if (!anchor) return;
    const style: CSSProperties = { position: "fixed" };
    switch (placement) {
      case "bottom":
        style.left = anchor.left + anchor.width / 2;
        style.top = anchor.bottom + GAP;
        style.transform = "translateX(-50%)";
        break;
      case "left":
        style.right = window.innerWidth - anchor.left + GAP;
        style.top = anchor.top + anchor.height / 2;
        style.transform = "translateY(-50%)";
        break;
      case "right":
        style.left = anchor.right + GAP;
        style.top = anchor.top + anchor.height / 2;
        style.transform = "translateY(-50%)";
        break;
      case "top":
      default:
        style.left = anchor.left + anchor.width / 2;
        style.bottom = window.innerHeight - anchor.top + GAP;
        style.transform = "translateX(-50%)";
        break;
    }
    setCoords(style);
  }, [open, placement]);

  // Escape also closes when focus is on a descendant control.
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [open, hide]);

  const hostClass = ["ui-tooltip-host", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      ref={triggerRef}
      className={hostClass}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      aria-describedby={open ? tooltipId : undefined}
    >
      {children}
      {open &&
        text &&
        createPortal(
          <span
            id={tooltipId}
            className="ui-tooltip ui-tooltip__pane"
            role="tooltip"
            style={coords}
          >
            {text}
          </span>,
          document.body,
        )}
    </span>
  );
}
