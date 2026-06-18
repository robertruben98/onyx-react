import type { CSSProperties } from "react";
import "./progress-bar.scss";

export interface ProgressBarProps {
  /** Current value. */
  value?: number;
  /** Maximum value. */
  max?: number;
  /** Indeterminate (unknown-progress) mode. */
  indeterminate?: boolean;
  /** Accessible label. */
  label?: string;
  /** Extra class names applied to the host element. */
  className?: string;
}

/**
 * Progress indicator. Determinate by default (driven by `value`/`max`) or
 * `indeterminate`. Exposes `role=progressbar` with the matching ARIA values.
 * React port of the Onyx UI Angular `ui-progress-bar`.
 */
export function ProgressBar({
  value = 0,
  max = 100,
  indeterminate = false,
  label = "",
  className,
}: ProgressBarProps) {
  const effectiveMax = max || 100;
  const percent = Math.max(0, Math.min(100, (value / effectiveMax) * 100));

  const hostClass = [
    "ui-progress-bar",
    "ui-progress",
    indeterminate ? "ui-progress--indeterminate" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const fillStyle: CSSProperties = indeterminate
    ? {}
    : { width: `${percent}%` };

  return (
    <div
      className={hostClass}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : value}
      aria-label={label || undefined}
    >
      <div className="ui-progress__track">
        <div className="ui-progress__fill" style={fillStyle} />
      </div>
    </div>
  );
}
