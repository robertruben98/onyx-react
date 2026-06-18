import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Popover } from "./Popover";

const axeOptions = { rules: { region: { enabled: false } } };

function renderPopover(props?: Partial<Parameters<typeof Popover>[0]>) {
  return render(
    <Popover
      label="Details"
      content={
        <>
          <p>Popover body</p>
          <button type="button">Action</button>
        </>
      }
      {...props}
    >
      <button type="button">Open</button>
    </Popover>,
  );
}

describe("Popover", () => {
  it("is collapsed initially", () => {
    renderPopover();
    expect(screen.getByText("Open").closest("[aria-haspopup]")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens on click and exposes a labelled dialog", async () => {
    renderPopover();
    await userEvent.click(screen.getByText("Open"));
    const dialog = await screen.findByRole("dialog", { name: "Details" });
    expect(dialog).toHaveTextContent("Popover body");
    expect(screen.getByText("Open").closest("[aria-haspopup]")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("toggles closed on a second trigger click", async () => {
    renderPopover();
    await userEvent.click(screen.getByText("Open"));
    await screen.findByRole("dialog");
    await userEvent.click(screen.getByText("Open"));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("closes on Escape", async () => {
    renderPopover();
    await userEvent.click(screen.getByText("Open"));
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("closes on backdrop (outside) click", async () => {
    renderPopover();
    await userEvent.click(screen.getByText("Open"));
    await screen.findByRole("dialog");
    const backdrop = document.querySelector(
      ".ui-popover__backdrop",
    ) as HTMLElement;
    await userEvent.click(backdrop);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("does not open when disabled and emits no events", async () => {
    const onOpenChange = vi.fn();
    renderPopover({ disabled: true, onOpenChange });
    await userEvent.click(screen.getByText("Open"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("emits onOpenChange when toggled", async () => {
    const onOpenChange = vi.fn();
    renderPopover({ onOpenChange });
    await userEvent.click(screen.getByText("Open"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("restores focus to the trigger on close", async () => {
    renderPopover();
    const trigger = screen.getByText("Open");
    await userEvent.click(trigger);
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("has no axe violations while open", async () => {
    renderPopover();
    await userEvent.click(screen.getByText("Open"));
    await screen.findByRole("dialog");
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });
});
