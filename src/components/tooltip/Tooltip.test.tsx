import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("shows a tooltip on hover and wires aria-describedby", async () => {
    render(
      <Tooltip text="Helpful hint">
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Hover me" });

    await userEvent.hover(trigger);

    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent("Helpful hint");
    expect(
      screen.getByText("Hover me").closest("[aria-describedby]"),
    ).toHaveAttribute("aria-describedby", tip.id);
  });

  it("hides the tooltip on unhover", async () => {
    render(
      <Tooltip text="Helpful hint">
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button");
    await userEvent.hover(trigger);
    await screen.findByRole("tooltip");
    await userEvent.unhover(trigger);
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
    );
  });

  it("shows on focus and hides on Escape", async () => {
    render(
      <Tooltip text="Helpful hint">
        <button type="button">Focus me</button>
      </Tooltip>,
    );
    await userEvent.tab();
    await screen.findByRole("tooltip");
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
    );
  });

  it("does not show when text is empty", async () => {
    render(
      <Tooltip text="">
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    await userEvent.hover(screen.getByRole("button"));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("has no axe violations while shown", async () => {
    const { baseElement } = render(
      <Tooltip text="Helpful hint">
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    await userEvent.hover(screen.getByRole("button"));
    await screen.findByRole("tooltip");
    expect(
      await axe(baseElement, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
