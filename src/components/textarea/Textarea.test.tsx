import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("associates a visible label with the control", () => {
    render(<Textarea label="Bio" />);
    expect(screen.getByLabelText("Bio")).toBeInTheDocument();
  });

  it("falls back to ariaLabel when no visible label is given", () => {
    render(<Textarea ariaLabel="Notes" />);
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
  });

  it("emits onValueChange as the user types", async () => {
    const onValueChange = vi.fn();
    render(<Textarea label="Bio" onValueChange={onValueChange} />);
    await userEvent.type(screen.getByLabelText("Bio"), "hi");
    expect(onValueChange).toHaveBeenLastCalledWith("hi");
  });

  it("is reachable by keyboard", async () => {
    render(<Textarea label="Bio" />);
    await userEvent.tab();
    expect(screen.getByLabelText("Bio")).toHaveFocus();
  });

  it("reflects invalid via aria-invalid", () => {
    render(<Textarea label="Bio" invalid />);
    expect(screen.getByLabelText("Bio")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("does NOT accept input when disabled", async () => {
    const onValueChange = vi.fn();
    render(<Textarea label="Bio" disabled onValueChange={onValueChange} />);
    const el = screen.getByLabelText("Bio");
    expect(el).toBeDisabled();
    await userEvent.type(el, "x");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("fires onBlurred when focus leaves the control", async () => {
    const onBlurred = vi.fn();
    render(<Textarea label="Bio" onBlurred={onBlurred} />);
    const el = screen.getByLabelText("Bio");
    await userEvent.click(el);
    await userEvent.tab();
    expect(onBlurred).toHaveBeenCalled();
  });

  describe("controlled value (two-way)", () => {
    function Host({ initial }: { initial: string }) {
      const [model, setModel] = useState(initial);
      return <Textarea label="Bio" value={model} onValueChange={setModel} />;
    }

    it("writes the model value into the control", async () => {
      render(<Host initial="hello" />);
      await waitFor(() =>
        expect(screen.getByLabelText("Bio")).toHaveValue("hello"),
      );
    });

    it("updates the model when the user types", async () => {
      render(<Host initial="" />);
      const el = screen.getByLabelText("Bio");
      await userEvent.type(el, "world");
      expect(el).toHaveValue("world");
    });
  });

  it("has no axe violations (default)", async () => {
    const { container } = render(<Textarea label="Bio" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations (invalid)", async () => {
    const { container } = render(<Textarea label="Bio" invalid />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
