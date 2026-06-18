import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Accordion, AccordionItem } from "./Accordion";

function renderAccordion(multi = false) {
  return render(
    <Accordion multi={multi}>
      <AccordionItem heading="One">First body</AccordionItem>
      <AccordionItem heading="Two">Second body</AccordionItem>
      <AccordionItem heading="Three" disabled>
        Third body
      </AccordionItem>
    </Accordion>,
  );
}

describe("Accordion", () => {
  it("starts collapsed with aria-expanded=false", () => {
    renderAccordion();
    for (const name of ["One", "Two", "Three"]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    }
  });

  it("expands an item on click", async () => {
    renderAccordion();
    await userEvent.click(screen.getByRole("button", { name: "One" }));
    expect(screen.getByRole("button", { name: "One" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("region", { name: "One" })).not.toHaveAttribute(
      "hidden",
    );
  });

  it("collapses others in single mode", async () => {
    renderAccordion(false);
    await userEvent.click(screen.getByRole("button", { name: "One" }));
    await userEvent.click(screen.getByRole("button", { name: "Two" }));
    expect(screen.getByRole("button", { name: "One" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("button", { name: "Two" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("keeps multiple open in multi mode", async () => {
    renderAccordion(true);
    await userEvent.click(screen.getByRole("button", { name: "One" }));
    await userEvent.click(screen.getByRole("button", { name: "Two" }));
    expect(screen.getByRole("button", { name: "One" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: "Two" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("does not toggle a disabled item", async () => {
    renderAccordion();
    await userEvent.click(screen.getByRole("button", { name: "Three" }));
    expect(screen.getByRole("button", { name: "Three" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("has no axe violations", async () => {
    const { container } = renderAccordion();
    expect(await axe(container)).toHaveNoViolations();
  });
});
