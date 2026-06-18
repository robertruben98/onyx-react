import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("exposes role=progressbar with ARIA value attributes", () => {
    render(<ProgressBar value={40} label="Upload" />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps the fill width to 0–100%", () => {
    const { container } = render(<ProgressBar value={150} />);
    const fill = container.querySelector(".ui-progress__fill") as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  it("computes percentage against a custom max", () => {
    const { container } = render(<ProgressBar value={1} max={4} />);
    const fill = container.querySelector(".ui-progress__fill") as HTMLElement;
    expect(fill.style.width).toBe("25%");
  });

  it("omits aria-valuenow when indeterminate", () => {
    render(<ProgressBar indeterminate label="Loading" />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute(
      "aria-valuenow",
    );
  });

  it.each([
    ["determinate", <ProgressBar value={60} label="Progress" />],
    ["indeterminate", <ProgressBar indeterminate label="Loading" />],
  ])("has no axe violations (%s)", async (_name, element) => {
    const { container } = render(element as React.ReactElement);
    expect(await axe(container)).toHaveNoViolations();
  });
});
