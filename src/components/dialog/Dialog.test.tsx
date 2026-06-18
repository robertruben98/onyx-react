import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Dialog, type DialogProps } from "./Dialog";

const axeOptions = { rules: { region: { enabled: false } } };

// Host wires a real trigger button so focus-restoration can be asserted, and
// makes `open` two-way like the Angular [(open)] model.
function Host({
  initialOpen = false,
  onClosed,
  ...props
}: { initialOpen?: boolean } & Partial<DialogProps>) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        heading="Confirm"
        onClosed={onClosed}
        footer={
          <button type="button" onClick={() => setOpen(false)}>
            Cancel
          </button>
        }
        {...props}
      >
        <p>Dialog body</p>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("renders nothing until opened", () => {
    render(<Host initialOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes role=dialog with aria-modal and is labelled by the heading", async () => {
    render(<Host initialOpen heading="Confirm" />);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Confirm");
  });

  it("uses aria-label when no heading is provided", async () => {
    render(<Host initialOpen heading="" ariaLabel="Settings" />);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Settings");
  });

  it("moves focus into the dialog on open (focus trap)", async () => {
    render(<Host initialOpen />);
    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );
  });

  it("restores focus to the trigger when closed", async () => {
    const user = userEvent.setup();
    render(<Host initialOpen={false} />);
    const trigger = screen.getByRole("button", { name: "Open" });
    trigger.focus();
    await user.click(trigger);

    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("closes on Escape and emits onClosed", async () => {
    const user = userEvent.setup();
    const onClosed = vi.fn();
    render(<Host initialOpen onClosed={onClosed} />);
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(onClosed).toHaveBeenCalledTimes(1);
  });

  it("does not close on Escape when closeOnEsc is false", async () => {
    const user = userEvent.setup();
    render(<Host initialOpen closeOnEsc={false} />);
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    render(<Host initialOpen />);
    await screen.findByRole("dialog");

    const backdrop = document.querySelector(
      ".ui-dialog__backdrop",
    ) as HTMLElement;
    expect(backdrop).toBeTruthy();
    await user.click(backdrop);

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("does not close on backdrop click when closeOnBackdrop is false", async () => {
    const user = userEvent.setup();
    render(<Host initialOpen closeOnBackdrop={false} />);
    await screen.findByRole("dialog");

    const backdrop = document.querySelector(
      ".ui-dialog__backdrop",
    ) as HTMLElement;
    await user.click(backdrop);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes and emits when the close button is activated", async () => {
    const user = userEvent.setup();
    const onClosed = vi.fn();
    render(<Host initialOpen onClosed={onClosed} />);
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(onClosed).toHaveBeenCalledTimes(1);
  });

  it("emits onOpened when attached", async () => {
    const onOpened = vi.fn();
    render(<Host initialOpen onOpened={onOpened} />);
    await screen.findByRole("dialog");
    expect(onOpened).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations when open", async () => {
    render(<Host initialOpen heading="Confirm" />);
    const dialog = await screen.findByRole("dialog");
    expect(await axe(dialog, axeOptions)).toHaveNoViolations();
  });
});
