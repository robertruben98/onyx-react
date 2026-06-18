import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Alert, type AlertVariant } from "./Alert";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Alert", () => {
  it("projects content and renders the title", () => {
    render(<Alert title="Heads up">Something happened</Alert>);
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Something happened")).toBeInTheDocument();
  });

  it("uses role=status for non-danger variants", () => {
    render(<Alert variant="info">Info</Alert>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses role=alert for the danger variant", () => {
    render(<Alert variant="danger">Error</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("has no dismiss button unless dismissible", () => {
    render(<Alert variant="info">Info</Alert>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("emits onDismissed and hides the host when dismissed", async () => {
    const onDismissed = vi.fn();
    const { container } = render(
      <Alert variant="info" dismissible dismissLabel="Cerrar" onDismissed={onDismissed}>
        Info
      </Alert>,
    );
    await userEvent.click(screen.getByRole("button", { name: /cerrar/i }));
    expect(onDismissed).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".ui-alert")).toHaveAttribute("hidden");
  });

  it("dismiss button is keyboard operable", async () => {
    const onDismissed = vi.fn();
    render(
      <Alert variant="info" dismissible onDismissed={onDismissed}>
        Info
      </Alert>,
    );
    await userEvent.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onDismissed).toHaveBeenCalledTimes(1);
  });

  it.each(["neutral", "info", "success", "warning", "danger"] as const)(
    "has no axe violations (%s variant)",
    async (variant: AlertVariant) => {
      const { container } = render(
        <Alert variant={variant} title="Title" dismissible>
          Body
        </Alert>,
      );
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});
