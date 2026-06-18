import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

const axeOptions = { rules: { region: { enabled: false } } };

describe("Card", () => {
  it("projects default (body) content", () => {
    render(<Card>Body content</Card>);
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("projects header and footer slots", () => {
    render(
      <Card header={<span>Header</span>} footer={<span>Footer</span>}>
        Body
      </Card>,
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("omits header and footer when no slot content is given", () => {
    const { container } = render(<Card>Body</Card>);
    expect(container.querySelector(".ui-card__header")).toBeNull();
    expect(container.querySelector(".ui-card__footer")).toBeNull();
  });

  it("applies the default elevated variant class", () => {
    const { container } = render(<Card>Body</Card>);
    expect(container.querySelector(".ui-card")).toHaveClass("ui-card--elevated");
  });

  it("applies the variant class to the host", () => {
    const { container } = render(<Card variant="outlined">Body</Card>);
    expect(container.querySelector(".ui-card")).toHaveClass("ui-card--outlined");
  });

  it.each(["elevated", "outlined"] as const)(
    "has no axe violations (%s)",
    async (variant) => {
      const { container } = render(
        <Card
          variant={variant}
          header={<span>Title</span>}
          footer={<span>Actions</span>}
        >
          Content
        </Card>,
      );
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});
