import "./spinner.scss";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  /** Spinner size. */
  size?: SpinnerSize;
  /** Accessible status label announced by assistive tech. */
  label?: string;
  /** Extra class names applied to the host element. */
  className?: string;
}

const SIZE_CLASS: Record<SpinnerSize, string> = {
  sm: "ui-spinner--sm",
  md: "",
  lg: "ui-spinner--lg",
};

/**
 * Indeterminate loading indicator. Exposes `role=status` with an accessible
 * `label`; the spinning ring itself is decorative (`aria-hidden`). React port
 * of the Onyx UI Angular `ui-spinner`.
 */
export function Spinner({
  size = "md",
  label = "Loading",
  className,
}: SpinnerProps) {
  const hostClass = ["ui-spinner", SIZE_CLASS[size], className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={hostClass} role="status" aria-label={label}>
      <span className="ui-spinner__ring" aria-hidden="true" />
    </span>
  );
}
