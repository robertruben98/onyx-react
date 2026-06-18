import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Select, type SelectOption } from "./Select";

const axeOptions = { rules: { region: { enabled: false } } };

const OPTIONS: SelectOption[] = [
  { value: "ng", label: "Angular" },
  { value: "rx", label: "RxJS" },
  { value: "sd", label: "Style Dictionary", disabled: true },
];

function ControlledSelect({
  onChange,
}: {
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Select
      options={OPTIONS}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

describe("Select", () => {
  it("shows the placeholder and a collapsed combobox", () => {
    render(<Select options={OPTIONS} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveTextContent("Select…");
  });

  it("opens a listbox of options on click", async () => {
    const user = userEvent.setup();
    render(<Select options={OPTIONS} />);
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("selects an option, updates the value and closes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledSelect onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "RxJS" }));

    expect(onChange).toHaveBeenCalledWith("rx");
    expect(screen.getByRole("combobox")).toHaveTextContent("RxJS");
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
  });

  it("selects with keyboard (arrow + enter)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledSelect onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    // active starts at first enabled (Angular); ArrowDown -> RxJS; Enter selects.
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("rx");
  });

  it("does not select a disabled option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledSelect onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(
      await screen.findByRole("option", { name: "Style Dictionary" }),
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Select options={OPTIONS} />);
    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<Select options={OPTIONS} disabled />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("has no axe violations (closed and open)", async () => {
    const user = userEvent.setup();
    const { container } = render(<Select options={OPTIONS} />);
    expect(await axe(container, axeOptions)).toHaveNoViolations();
    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });
});
