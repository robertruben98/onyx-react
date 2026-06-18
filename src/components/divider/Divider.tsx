import type { ReactNode } from "react";
import "./divider.scss";

export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps {
  /** Layout orientation. */
  orientation?: DividerOrientation;
  /** Optional centered label (horizontal only). */
  label?: ReactNode;
  /** Extra class names applied to the host element. */
  className?: string;
}

/**
 * Visual separator. Renders a plain rule, or a labelled rule when `label` is
 * set. Exposes `role=separator` with the matching `aria-orientation`. React
 * port of the Onyx UI Angular `ui-divider`.
 */
export function Divider({
  orientation = "horizontal",
  label,
  className,
}: DividerProps) {
  const labelled = label != null && label !== "";

  const hostClass = [
    "ui-divider",
    orientation === "horizontal" ? "ui-divider--horizontal" : "",
    orientation === "vertical" ? "ui-divider--vertical" : "",
    labelled ? "ui-divider--labelled" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={hostClass}
      role="separator"
      aria-orientation={orientation}
    >
      {labelled && (
        <>
          <span className="ui-divider__line" aria-hidden="true" />
          <span className="ui-divider__label">{label}</span>
          <span className="ui-divider__line" aria-hidden="true" />
        </>
      )}
    </div>
  );
}
