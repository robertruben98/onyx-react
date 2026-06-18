import type { ReactNode } from "react";
import "./tag.scss";

export type TagVariant = "neutral" | "info" | "success" | "warning" | "danger";

export interface TagProps {
  /** Visual variant (semantic role). */
  variant?: TagVariant;
  /** Whether a remove (close) button is shown. */
  removable?: boolean;
  /** Accessible name for the remove button. */
  removeLabel?: string;
  /** Emitted when the remove button is activated. */
  onRemoved?: () => void;
  children?: ReactNode;
  /** Extra class names applied to the host element. */
  className?: string;
}

/**
 * Compact label / chip in semantic variants, optionally removable via a close
 * button. React port of the Onyx UI Angular `ui-tag`.
 */
export function Tag({
  variant = "neutral",
  removable = false,
  removeLabel = "Remove",
  onRemoved,
  children,
  className,
}: TagProps) {
  const hostClass = ["ui-tag", `ui-tag--${variant}`, className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={hostClass}>
      <span className="ui-tag__label">{children}</span>
      {removable && (
        <button
          type="button"
          className="ui-tag__remove"
          aria-label={removeLabel}
          onClick={() => onRemoved?.()}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </span>
  );
}
