import {
  Children,
  isValidElement,
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import "./tabs.scss";

export interface TabProps {
  /** Trigger label shown in the tab list. */
  label: string;
  /** Whether this tab is disabled. */
  disabled?: boolean;
  /** Panel content projected for this tab. */
  children?: ReactNode;
}

/**
 * A single tab. Declares its trigger `label` and projects the panel content.
 * Rendered and coordinated by the parent `Tabs`. Used purely as a declarative
 * marker — `Tabs` reads its props; it is never rendered on its own.
 */
export function Tab(_props: TabProps): null {
  return null;
}

export interface TabsProps {
  /** Accessible label for the tab list. */
  ariaLabel?: string;
  /** Selected tab index (controlled). Pair with `onSelectedIndexChange`. */
  selectedIndex?: number;
  /** Initial selected index when uncontrolled. */
  defaultSelectedIndex?: number;
  /** Emitted when the selected index changes (two-way model). */
  onSelectedIndexChange?: (index: number) => void;
  /** `Tab` children declaring each trigger + panel. */
  children?: ReactNode;
  /** Extra class names applied to the host element. */
  className?: string;
}

interface ResolvedTab {
  label: string;
  disabled: boolean;
  content: ReactNode;
}

/**
 * Tabbed interface. Renders a `role=tablist` of triggers from the declared
 * `Tab` children and shows the selected panel. Full keyboard support
 * (arrows / Home / End) with roving tabindex. React port of the Onyx UI
 * Angular `ui-tabs`.
 */
export function Tabs({
  ariaLabel = "",
  selectedIndex,
  defaultSelectedIndex = 0,
  onSelectedIndexChange,
  children,
  className,
}: TabsProps) {
  const baseId = useId();
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs: ResolvedTab[] = Children.toArray(children)
    .filter(
      (child): child is ReactElement<TabProps> =>
        isValidElement(child) && child.type === Tab,
    )
    .map((child) => ({
      label: child.props.label,
      disabled: child.props.disabled ?? false,
      content: child.props.children,
    }));

  const isControlled = selectedIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(defaultSelectedIndex);
  const currentIndex = isControlled ? selectedIndex : internalIndex;

  const setSelected = useCallback(
    (index: number) => {
      if (!isControlled) setInternalIndex(index);
      onSelectedIndexChange?.(index);
    },
    [isControlled, onSelectedIndexChange],
  );

  const tabId = (i: number) => `ui-tab-${baseId}-${i}`;
  const panelId = (i: number) => `ui-tabpanel-${baseId}-${i}`;

  const select = (index: number): void => {
    if (tabs[index]?.disabled) return;
    setSelected(index);
  };

  /** First enabled index walking `step` from `from` (exclusive), wrapping. */
  const nextEnabled = (from: number, step: number): number | null => {
    const n = tabs.length;
    if (!n) return null;
    for (let k = 1; k <= n; k++) {
      const i = (((from + step * k) % n) + n) % n;
      if (!tabs[i].disabled) return i;
    }
    return null;
  };

  const onKeydown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const last = tabs.length - 1;
    let target: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        target = nextEnabled(index, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        target = nextEnabled(index, -1);
        break;
      case "Home":
        target = nextEnabled(-1, 1);
        break;
      case "End":
        target = nextEnabled(last + 1, -1);
        break;
      default:
        return;
    }
    if (target === null) return;
    event.preventDefault();
    setSelected(target);
    triggerRefs.current[target]?.focus();
  };

  const hostClass = ["ui-tabs", className ?? ""].filter(Boolean).join(" ");

  return (
    <div className={hostClass}>
      <div
        className="ui-tabs__list"
        role="tablist"
        aria-label={ariaLabel || undefined}
      >
        {tabs.map((tab, i) => {
          const active = i === currentIndex;
          const tabClass = [
            "ui-tabs__tab",
            active ? "ui-tabs__tab--active" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={tabId(i)}
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              className={tabClass}
              id={tabId(i)}
              aria-selected={active}
              aria-controls={panelId(i)}
              tabIndex={active ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => select(i)}
              onKeyDown={(event) => onKeydown(event, i)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="ui-tabs__panels">
        {tabs.map((tab, i) => (
          <div
            key={panelId(i)}
            role="tabpanel"
            id={panelId(i)}
            aria-labelledby={tabId(i)}
            hidden={i !== currentIndex}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
