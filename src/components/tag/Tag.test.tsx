import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { Tag, type TagVariant } from "./Tag";

describe("Tag", () => {
  it("projects its content", () => {
    render(<Tag>Frontend</Tag>);
    expect(screen.getByText("Frontend")).toBeInTheDocument();
  });

  it("has no remove button unless removable", () => {
    render(<Tag>Tag</Tag>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("emits onRemoved when the remove button is clicked", async () => {
    const onRemoved = vi.fn();
    render(
      <Tag removable removeLabel="Quitar" onRemoved={onRemoved}>
        Tag
      </Tag>,
    );
    await userEvent.click(screen.getByRole("button", { name: /quitar/i }));
    expect(onRemoved).toHaveBeenCalledTimes(1);
  });

  it("remove button is keyboard operable", async () => {
    const onRemoved = vi.fn();
    render(
      <Tag removable onRemoved={onRemoved}>
        Tag
      </Tag>,
    );
    await userEvent.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onRemoved).toHaveBeenCalledTimes(1);
  });

  it.each(["neutral", "info", "success", "warning", "danger"] as const)(
    "has no axe violations (%s)",
    async (variant: TagVariant) => {
      const { container } = render(
        <Tag variant={variant} removable>
          Tag
        </Tag>,
      );
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
