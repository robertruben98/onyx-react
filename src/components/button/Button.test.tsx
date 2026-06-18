import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("emits onClicked when interactive", async () => {
    const onClicked = vi.fn();
    render(<Button onClicked={onClicked}>Go</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClicked).toHaveBeenCalledTimes(1);
  });

  it("does not emit when disabled", async () => {
    const onClicked = vi.fn();
    render(
      <Button disabled onClicked={onClicked}>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClicked).not.toHaveBeenCalled();
  });

  it("does not emit when loading", async () => {
    const onClicked = vi.fn();
    render(
      <Button loading onClicked={onClicked}>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClicked).not.toHaveBeenCalled();
  });

  it("sets aria-busy while loading", () => {
    render(<Button loading>Go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Button>Save</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
