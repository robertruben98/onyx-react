import { useState, type ReactNode } from "react";
import "./alert.scss";

export type AlertVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

export interface AlertProps {
  /** Visual variant (semantic role). */
  variant?: AlertVariant;
  /** Optional bold title rendered above the content. */
  title?: string;
  /** Whether a dismiss (close) button is shown. */
  dismissible?: boolean;
  /** Accessible name for the dismiss button. */
  dismissLabel?: string;
  /** Emitted when the alert is dismissed. */
  onDismissed?: () => void;
  children?: ReactNode;
  /** Extra class names applied to the host element. */
  className?: string;
}

const VARIANT_CLASS: Record<AlertVariant, string> = {
  neutral: "ui-alert--neutral",
  info: "ui-alert--info",
  success: "ui-alert--success",
  warning: "ui-alert--warning",
  danger: "ui-alert--danger",
};

/**
 * Inline feedback banner with semantic variants, optional title, and a dismiss
 * action. React port of the Onyx UI Angular `ui-alert`.
 */
export function Alert({
  variant = "info",
  title = "",
  dismissible = false,
  dismissLabel = "Dismiss",
  onDismissed,
  children,
  className,
}: AlertProps) {
  const [hidden, setHidden] = useState(false);

  // danger -> assertive (alert); others -> polite (status).
  const role = variant === "danger" ? "alert" : "status";

  const hostClass = ["ui-alert", VARIANT_CLASS[variant], className ?? ""]
    .filter(Boolean)
    .join(" ");

  const dismiss = (): void => {
    setHidden(true);
    onDismissed?.();
  };

  return (
    <div className={hostClass} hidden={hidden || undefined}>
      <div className="ui-alert__el" role={role}>
        <div className="ui-alert__body">
          {title && <p className="ui-alert__title">{title}</p>}
          <div className="ui-alert__content">{children}</div>
        </div>
        {dismissible && (
          <button
            type="button"
            className="ui-alert__close"
            aria-label={dismissLabel}
            onClick={dismiss}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        )}
      </div>
    </div>
  );
}
