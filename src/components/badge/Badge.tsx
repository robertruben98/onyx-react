import type { ReactNode } from "react";
import "./badge.scss";

export type BadgeVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

export interface BadgeProps {
  /** Visual variant (semantic role). */
  variant?: BadgeVariant;
  children?: ReactNode;
  /** Extra class names applied to the host element. */
  className?: string;
}

/**
 * Small status label with neutral, info, success, warning and danger variants.
 * React port of the Onyx UI Angular `ui-badge`.
 */
export function Badge({
  variant = "neutral",
  children,
  className,
}: BadgeProps) {
  const hostClass = ["ui-badge", `ui-badge--${variant}`, className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={hostClass}>
      <span className="ui-badge__el">{children}</span>
    </span>
  );
}
