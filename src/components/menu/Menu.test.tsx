import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Menu, type MenuItem } from "./Menu";

const axeOptions = { rules: { region: { enabled: false } } };

const ITEMS: MenuItem[] = [
  { id: "edit", label: "Edit" },
  { id: "dup", label: "Duplicate" },
  { id: "del", label: "Delete", disabled: true },
];

function renderMenu(onItemSelect = vi.fn()) {
  return render(
    <Menu items={ITEMS} onItemSelect={onItemSelect}>
      Actions
    </Menu>,
  );
}

describe("Menu", () => {
  it("renders a collapsed trigger with aria-haspopup=menu", () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the menu and lists items", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
  });

  it("emits the chosen item and closes on click", async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    renderMenu(onItemSelect);
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Duplicate" }));
    expect(onItemSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "dup" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
  });

  it("focuses the first item on open and moves with ArrowDown", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await screen.findByRole("menu");
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus(),
    );
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
  });

  it("does not emit for a disabled item", async () => {
    const user = userEvent.setup();
    const onItemSelect = vi.fn();
    renderMenu(onItemSelect);
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));
    expect(onItemSelect).not.toHaveBeenCalled();
  });

  it("closes on Escape and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Actions" });
    await user.click(trigger);
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("closes when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await screen.findByRole("menu");
    const backdrop = document.querySelector(".ui-menu__backdrop");
    expect(backdrop).not.toBeNull();
    await user.click(backdrop as Element);
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
  });

  it("opens with ArrowDown from the trigger", async () => {
    const user = userEvent.setup();
    renderMenu();
    screen.getByRole("button", { name: "Actions" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await screen.findByRole("menu");
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });
});
