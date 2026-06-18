import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("exposes a checkbox with an accessible name from the label", () => {
    render(<Checkbox label="Accept terms" />);
    expect(
      screen.getByRole("checkbox", { name: /accept terms/i }),
    ).toBeInTheDocument();
  });

  it("falls back to ariaLabel when no visible label is given", () => {
    render(<Checkbox ariaLabel="Select row" />);
    expect(
      screen.getByRole("checkbox", { name: /select row/i }),
    ).toBeInTheDocument();
  });

  it("emits onCheckedChange when toggled by pointer", async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="A" onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("is toggleable by keyboard (Space)", async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="A" onCheckedChange={onCheckedChange} />);
    await userEvent.tab();
    expect(screen.getByRole("checkbox")).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("does NOT emit when disabled", async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="A" disabled onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox");
    expect(box).toBeDisabled();
    await userEvent.click(box);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("reflects the indeterminate state on the native control", () => {
    render(<Checkbox label="A" indeterminate />);
    const box = screen.getByRole<HTMLInputElement>("checkbox");
    expect(box.indeterminate).toBe(true);
  });

  it("reflects invalid via aria-invalid", () => {
    render(<Checkbox label="A" invalid />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("calls onBlurred when the control loses focus", async () => {
    const onBlurred = vi.fn();
    render(<Checkbox label="A" onBlurred={onBlurred} />);
    await userEvent.tab();
    await userEvent.tab();
    expect(onBlurred).toHaveBeenCalled();
  });

  describe("two-way binding (controlled)", () => {
    function Host() {
      const [model, setModel] = useState(true);
      return <Checkbox label="A" checked={model} onCheckedChange={setModel} />;
    }

    it("writes the model value into the control", async () => {
      render(<Host />);
      await waitFor(() => expect(screen.getByRole("checkbox")).toBeChecked());
    });

    it("updates the model when toggled", async () => {
      render(<Host />);
      const box = screen.getByRole("checkbox");
      await userEvent.click(box);
      await waitFor(() => expect(box).not.toBeChecked());
    });
  });

  it("supports uncontrolled defaultChecked", () => {
    render(<Checkbox label="A" defaultChecked />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("has no axe violations (default)", async () => {
    const { container } = render(<Checkbox label="A" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(<Checkbox label="A" disabled />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations (indeterminate)", async () => {
    const { container } = render(<Checkbox label="A" indeterminate />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
