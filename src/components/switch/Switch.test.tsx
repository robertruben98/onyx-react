import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("exposes a switch with an accessible name from the label", () => {
    render(<Switch label="Notifications" />);
    expect(
      screen.getByRole("switch", { name: /notifications/i }),
    ).toBeInTheDocument();
  });

  it("falls back to ariaLabel when no visible label is given", () => {
    render(<Switch ariaLabel="Dark mode" />);
    expect(
      screen.getByRole("switch", { name: /dark mode/i }),
    ).toBeInTheDocument();
  });

  it("emits onCheckedChange when toggled by pointer", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="A" onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("is toggleable by keyboard (Space)", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="A" onCheckedChange={onCheckedChange} />);
    await userEvent.tab();
    expect(screen.getByRole("switch")).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("does NOT emit when disabled", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="A" disabled onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch");
    expect(sw).toBeDisabled();
    await userEvent.click(sw);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("reflects invalid via aria-invalid", () => {
    render(<Switch ariaLabel="A" invalid />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-invalid", "true");
  });

  describe("controlled (two-way value)", () => {
    function Host() {
      const [checked, setChecked] = useState(true);
      return (
        <Switch label="A" checked={checked} onCheckedChange={setChecked} />
      );
    }

    it("writes the value into the control", () => {
      render(<Host />);
      expect(screen.getByRole("switch")).toBeChecked();
    });

    it("updates the value when toggled", async () => {
      render(<Host />);
      const sw = screen.getByRole("switch");
      await userEvent.click(sw);
      expect(sw).not.toBeChecked();
    });
  });

  it("supports uncontrolled defaultChecked", () => {
    render(<Switch label="A" defaultChecked />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("has no axe violations (default)", async () => {
    const { container } = render(<Switch label="A" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(<Switch label="A" disabled />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
