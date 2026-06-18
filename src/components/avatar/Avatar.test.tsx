import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("renders an image with the name as alt text", () => {
    render(<Avatar src="https://example.com/a.png" name="Ada Lovelace" />);
    const img = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(img).toHaveAttribute("src", "https://example.com/a.png");
  });

  it("falls back to initials when there is no image", () => {
    render(<Avatar name="Ada Lovelace" />);
    const el = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(el).toHaveTextContent("AL");
  });

  it("derives a single initial from a one-word name", () => {
    render(<Avatar name="Grace" />);
    expect(screen.getByRole("img", { name: "Grace" })).toHaveTextContent("G");
  });

  it("shows initials after the image errors", () => {
    const { container } = render(<Avatar src="broken.png" name="Ada Lovelace" />);
    const img = container.querySelector("img")!;
    fireEvent.error(img);
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)(
    "has no axe violations (size %s)",
    async (size) => {
      const { container } = render(<Avatar size={size} name="Ada Lovelace" />);
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
