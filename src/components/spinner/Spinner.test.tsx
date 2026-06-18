import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("exposes role=status with a default label", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading");
  });

  it("uses a custom label", () => {
    render(<Spinner label="Cargando" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Cargando");
  });

  it("applies the size class", () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole("status")).toHaveClass("ui-spinner--lg");
  });

  it.each(["sm", "md", "lg"] as const)(
    "has no axe violations (size %s)",
    async (size) => {
      const { container } = render(<Spinner size={size} />);
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
