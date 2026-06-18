import { useMemo, useState } from "react";
import "./avatar.scss";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "square";

export interface AvatarProps {
  /** Image source URL. */
  src?: string;
  /** Name for alt text and the initials fallback. */
  name?: string;
  /** Avatar size. */
  size?: AvatarSize;
  /** Avatar shape. */
  shape?: AvatarShape;
  /** Extra class names applied to the host element. */
  className?: string;
}

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: "ui-avatar--sm",
  md: "",
  lg: "ui-avatar--lg",
};

/** Up-to-two-letter initials derived from the name. */
function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * User avatar that shows an image when `src` resolves, otherwise initials
 * derived from `name`. The initials fallback exposes `role=img` + `aria-label`.
 * React port of the Onyx UI Angular `ui-avatar`.
 */
export function Avatar({
  src = "",
  name = "",
  size = "md",
  shape = "circle",
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showInitials = !src || imgError;
  const initials = useMemo(() => deriveInitials(name), [name]);

  const hostClass = [
    "ui-avatar",
    SIZE_CLASS[size],
    shape === "square" ? "ui-avatar--square" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={hostClass}
      role={showInitials ? "img" : undefined}
      aria-label={showInitials ? name || undefined : undefined}
    >
      {showInitials ? (
        <span className="ui-avatar__initials" aria-hidden="true">
          {initials}
        </span>
      ) : (
        <img
          className="ui-avatar__img"
          src={src}
          alt={name}
          onError={() => setImgError(true)}
        />
      )}
    </span>
  );
}
