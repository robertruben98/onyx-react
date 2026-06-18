import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Badge, type BadgeVariant } from "./Badge";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Badge", () => {
  it("projects its content", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies the variant class on the host", () => {
    const { container } = render(<Badge variant="success">OK</Badge>);
    expect(container.querySelector(".ui-badge")).toHaveClass(
      "ui-badge--success",
    );
  });

  it("defaults to the neutral variant", () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.querySelector(".ui-badge")).toHaveClass(
      "ui-badge--neutral",
    );
  });

  it.each(["neutral", "info", "success", "warning", "danger"] as const)(
    "has no axe violations (%s variant)",
    async (variant: BadgeVariant) => {
      const { container } = render(<Badge variant={variant}>Label</Badge>);
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});
