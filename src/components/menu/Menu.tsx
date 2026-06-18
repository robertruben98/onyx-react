import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import "./menu.scss";

export interface MenuItem {
  /** Stable identifier for the action. */
  id?: string;
  /** Visible label. */
  label: string;
  /** Whether the item is disabled. */
  disabled?: boolean;
}

export interface MenuProps {
  /** Menu items ({ id?, label, disabled? }). */
  items?: MenuItem[];
  /** Emitted with the chosen item on activation. */
  onItemSelect?: (item: MenuItem) => void;
  /** Trigger content (projected into the trigger button). */
  children?: ReactNode;
  /** Extra class names applied to the host element. */
  className?: string;
}

interface PanelPosition {
  top: number;
  left: number;
}

/**
 * Dropdown menu of actions. Trigger is a button with `aria-haspopup=menu`; the
 * panel is a `role=menu` rendered through a portal (placement bottom/start),
 * with focus moved onto items and full keyboard navigation. React port of the
 * Onyx UI Angular `ui-menu`.
 */
export function Menu({
  items = [],
  onItemSelect,
  children,
  className,
}: MenuProps) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PanelPosition>({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const hostClass = ["ui-menu", className ?? ""].filter(Boolean).join(" ");

  /** Enabled menuitem buttons currently in the overlay. */
  const itemElements = useCallback((): HTMLButtonElement[] => {
    const el = panelRef.current;
    if (!el) return [];
    return Array.from(
      el.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not([disabled])',
      ),
    );
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const openMenu = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    // placement: "bottom", align: "start"
    setPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setOpen(true);
  }, []);

  const toggle = useCallback(() => {
    if (open) {
      close();
    } else {
      openMenu();
    }
  }, [open, close, openMenu]);

  const onTriggerKeydown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (!open) openMenu();
    }
  };

  const onMenuKeydown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const els = itemElements();
    if (!els.length) return;
    const current = els.indexOf(document.activeElement as HTMLButtonElement);
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        els[(current + 1) % els.length].focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        els[(current - 1 + els.length) % els.length].focus();
        break;
      case "Home":
        event.preventDefault();
        els[0].focus();
        break;
      case "End":
        event.preventDefault();
        els[els.length - 1].focus();
        break;
      case "Escape":
      case "Tab":
        close();
        break;
    }
  };

  const activate = (item: MenuItem): void => {
    if (item.disabled) return;
    onItemSelect?.(item);
    close();
  };

  // Focus the first item on open (mirrors queueMicrotask focus in Angular).
  useLayoutEffect(() => {
    if (open) {
      itemElements()[0]?.focus();
    }
  }, [open, itemElements]);

  // Reposition on scroll / resize while open.
  useEffect(() => {
    if (!open) return;
    const reposition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  return (
    <span className={hostClass}>
      <button
        ref={triggerRef}
        type="button"
        className="ui-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
        onKeyDown={onTriggerKeydown}
      >
        {children}
      </button>

      {open &&
        createPortal(
          <>
            {/* Backdrop — click closes (CDK hasBackdrop equivalent). */}
            <div
              className="ui-menu__backdrop"
              style={{
                position: "fixed",
                inset: 0,
                background: "transparent",
              }}
              onClick={close}
            />
            <div
              ref={panelRef}
              role="menu"
              id={menuId}
              className="ui-menu__panel ui-menu__pane"
              style={{
                position: "absolute",
                top: position.top,
                left: position.left,
              }}
              onKeyDown={onMenuKeydown}
            >
              {items.map((item) => (
                <button
                  key={item.id ?? item.label}
                  type="button"
                  role="menuitem"
                  className="ui-menu__item"
                  tabIndex={-1}
                  disabled={item.disabled}
                  onClick={() => activate(item)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </span>
  );
}
