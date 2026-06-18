import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("exposes role=separator with horizontal orientation by default", () => {
    render(<Divider />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("reflects vertical orientation", () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("renders a label when provided", () => {
    render(<Divider label="OR" />);
    expect(screen.getByText("OR")).toBeInTheDocument();
    expect(screen.getByRole("separator")).toHaveClass("ui-divider--labelled");
  });

  it("does not add labelled class without a label", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).not.toHaveClass(
      "ui-divider--labelled",
    );
  });

  it.each([
    ["plain horizontal", <Divider key="h" />],
    ["vertical", <Divider key="v" orientation="vertical" />],
    ["labelled", <Divider key="l" label="Section" />],
  ])("has no axe violations (%s)", async (_name, node) => {
    const { container } = render(node);
    expect(await axe(container)).toHaveNoViolations();
  });
});
