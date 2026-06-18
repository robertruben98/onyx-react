import type { ReactNode } from "react";
import "./card.scss";

export type CardVariant = "elevated" | "outlined";

export interface CardProps {
  /** Visual variant. */
  variant?: CardVariant;
  /** Header slot content (Angular `[uiCardHeader]`). */
  header?: ReactNode;
  /** Footer slot content (Angular `[uiCardFooter]`). */
  footer?: ReactNode;
  /** Default slot — the card body. */
  children?: ReactNode;
  /** Extra class names applied to the host element. */
  className?: string;
}

/**
 * Surface container with optional header/footer slots. Pure presentation —
 * project content via `header`, `children` (body), and `footer`. React port of
 * the Onyx UI Angular `ui-card`.
 */
export function Card({
  variant = "elevated",
  header,
  footer,
  children,
  className,
}: CardProps) {
  const hostClass = [
    "ui-card",
    variant === "elevated" ? "ui-card--elevated" : "",
    variant === "outlined" ? "ui-card--outlined" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={hostClass}>
      {header != null && header !== false && (
        <div className="ui-card__header">{header}</div>
      )}
      <div className="ui-card__body">{children}</div>
      {footer != null && footer !== false && (
        <div className="ui-card__footer">{footer}</div>
      )}
    </div>
  );
}
