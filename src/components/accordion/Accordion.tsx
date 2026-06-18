import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
  type ReactNode,
} from "react";
import "./accordion.scss";

/** Contract a parent accordion exposes to its items. */
interface AccordionContextValue {
  multi: boolean;
  isExpanded: (id: string) => boolean;
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export interface AccordionProps {
  /** Allow multiple items to be expanded simultaneously. */
  multi?: boolean;
  /** Projected `AccordionItem` children. */
  children?: ReactNode;
  /** Extra class names applied to the host element. */
  className?: string;
}

/**
 * Vertical stack of collapsible sections. Single-open by default; set `multi`
 * to allow several open at once. Projects `AccordionItem` children. React port
 * of the Onyx UI Angular `ui-accordion`.
 */
export function Accordion({
  multi = false,
  children,
  className,
}: AccordionProps) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const isExpanded = useCallback(
    (id: string) => expanded.has(id),
    [expanded],
  );

  const toggleItem = useCallback(
    (id: string) => {
      setExpanded((prev) => {
        const willExpand = !prev.has(id);
        const next = new Set(multi ? prev : []);
        if (willExpand) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    },
    [multi],
  );

  const hostClass = ["ui-accordion", className ?? ""].filter(Boolean).join(" ");

  return (
    <AccordionContext.Provider value={{ multi, isExpanded, toggleItem }}>
      <div className={hostClass}>{children}</div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps {
  /** Header text of the section. */
  heading: string;
  /** Disables the section — a disabled item never toggles. */
  disabled?: boolean;
  /** Panel content. */
  children?: ReactNode;
  /** Extra class names applied to the host element. */
  className?: string;
}

/**
 * A single collapsible section. Renders a header button (`aria-expanded` +
 * `aria-controls`) and a `role=region` panel. Must be rendered inside an
 * `Accordion`, which coordinates expansion.
 */
export function AccordionItem({
  heading,
  disabled = false,
  children,
  className,
}: AccordionItemProps) {
  const ctx = useContext(AccordionContext);
  const uid = useId();
  const headerId = `ui-accordion-header-${uid}`;
  const panelId = `ui-accordion-panel-${uid}`;

  const expanded = ctx?.isExpanded(uid) ?? false;

  const handleClick = (): void => {
    if (disabled) return;
    ctx?.toggleItem(uid);
  };

  const hostClass = [
    "ui-accordion-item",
    expanded ? "ui-accordion-item--expanded" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={hostClass}>
      <h3 className="ui-accordion-item__heading">
        <button
          type="button"
          className="ui-accordion-item__trigger"
          id={headerId}
          aria-expanded={expanded}
          aria-controls={panelId}
          disabled={disabled}
          onClick={handleClick}
        >
          <span className="ui-accordion-item__label">{heading}</span>
          <span className="ui-accordion-item__icon" aria-hidden="true">
            ›
          </span>
        </button>
      </h3>
      <div
        className="ui-accordion-item__panel"
        role="region"
        id={panelId}
        aria-labelledby={headerId}
        hidden={!expanded}
      >
        <div className="ui-accordion-item__body">{children}</div>
      </div>
    </div>
  );
}
