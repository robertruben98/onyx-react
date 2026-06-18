import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("associates a visible label with the input", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("falls back to ariaLabel when no visible label is given", () => {
    render(<Input ariaLabel="Search" />);
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
  });

  it("emits onValueChange as the user types", async () => {
    const onValueChange = vi.fn();
    render(<Input label="Name" onValueChange={onValueChange} />);
    await userEvent.type(screen.getByLabelText("Name"), "abc");
    expect(onValueChange).toHaveBeenCalledTimes(3);
    expect(onValueChange).toHaveBeenLastCalledWith("abc");
  });

  it("is reachable by keyboard", async () => {
    render(<Input label="Name" />);
    await userEvent.tab();
    expect(screen.getByLabelText("Name")).toHaveFocus();
  });

  it("reflects invalid state via aria-invalid", () => {
    render(<Input label="Name" invalid />);
    expect(screen.getByLabelText("Name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("does NOT accept input when disabled", async () => {
    const onValueChange = vi.fn();
    render(<Input label="Name" disabled onValueChange={onValueChange} />);
    const el = screen.getByLabelText("Name");
    expect(el).toBeDisabled();
    await userEvent.type(el, "abc");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  describe("controlled (value + onValueChange)", () => {
    function Host() {
      const [model, setModel] = useState("initial");
      return <Input label="Name" value={model} onValueChange={setModel} />;
    }

    it("writes the model value into the input", async () => {
      render(<Host />);
      await waitFor(() =>
        expect(screen.getByLabelText("Name")).toHaveValue("initial"),
      );
    });

    it("updates the model when the user types", async () => {
      render(<Host />);
      const el = screen.getByLabelText("Name");
      await userEvent.clear(el);
      await userEvent.type(el, "hello");
      expect(el).toHaveValue("hello");
    });
  });

  it("uncontrolled: tracks its own value from defaultValue", async () => {
    render(<Input label="Name" defaultValue="seed" />);
    const el = screen.getByLabelText("Name");
    expect(el).toHaveValue("seed");
    await userEvent.type(el, "X");
    expect(el).toHaveValue("seedX");
  });

  it("has no axe violations (default)", async () => {
    const { container } = render(<Input label="Email" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations (invalid)", async () => {
    const { container } = render(<Input label="Email" invalid />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations (disabled)", async () => {
    const { container } = render(<Input label="Email" disabled />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
