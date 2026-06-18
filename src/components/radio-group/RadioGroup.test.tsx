import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup, type RadioOption } from "./RadioGroup";

const axeOptions = { rules: { region: { enabled: false } } };
const OPTIONS: RadioOption[] = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

describe("RadioGroup", () => {
  it("renders a named radiogroup with one radio per option", () => {
    render(<RadioGroup label="Size" options={OPTIONS} />);
    expect(
      screen.getByRole("radiogroup", { name: /size/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("emits onValueChange with the selected value on click", async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup label="Size" options={OPTIONS} onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByRole("radio", { name: /medium/i }));
    expect(onValueChange).toHaveBeenLastCalledWith("md");
  });

  it("is selectable by keyboard (focus + Space)", async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup label="Size" options={OPTIONS} onValueChange={onValueChange} />,
    );
    await userEvent.tab();
    const first = screen.getByRole("radio", { name: /small/i });
    expect(first).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(onValueChange).toHaveBeenLastCalledWith("sm");
  });

  it("disables an individual option", () => {
    render(
      <RadioGroup
        label="Size"
        options={[...OPTIONS, { label: "X-Large", value: "xl", disabled: true }]}
      />,
    );
    expect(screen.getByRole("radio", { name: /x-large/i })).toBeDisabled();
  });

  it("disables the whole group", () => {
    render(<RadioGroup label="Size" options={OPTIONS} disabled />);
    screen
      .getAllByRole("radio")
      .forEach((r) => expect(r).toBeDisabled());
  });

  it("does not emit when disabled", async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup
        label="Size"
        options={OPTIONS}
        disabled
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole("radio", { name: /medium/i }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("reflects invalid via aria-invalid", () => {
    render(<RadioGroup label="Size" options={OPTIONS} invalid />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  describe("controlled value", () => {
    function Host() {
      const [model, setModel] = useState("lg");
      return (
        <RadioGroup
          label="Size"
          options={OPTIONS}
          value={model}
          onValueChange={setModel}
        />
      );
    }

    it("writes the controlled value into the group", () => {
      render(<Host />);
      expect(screen.getByRole("radio", { name: /large/i })).toBeChecked();
    });

    it("updates the value on selection", async () => {
      render(<Host />);
      await userEvent.click(screen.getByRole("radio", { name: /small/i }));
      expect(screen.getByRole("radio", { name: /small/i })).toBeChecked();
    });
  });

  it("has no axe violations", async () => {
    const { container } = render(<RadioGroup label="Size" options={OPTIONS} />);
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
