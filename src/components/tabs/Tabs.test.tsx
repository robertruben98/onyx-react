import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { Tabs, Tab } from "./Tabs";

function BasicTabs(props: { onSelectedIndexChange?: (i: number) => void }) {
  return (
    <Tabs ariaLabel="Sections" onSelectedIndexChange={props.onSelectedIndexChange}>
      <Tab label="One">First panel</Tab>
      <Tab label="Two">Second panel</Tab>
      <Tab label="Three" disabled>
        Third panel
      </Tab>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("renders a tablist with one tab per child", () => {
    render(<BasicTabs />);
    expect(
      screen.getByRole("tablist", { name: "Sections" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("selects the first tab by default and wires ARIA", () => {
    render(<BasicTabs />);
    const first = screen.getByRole("tab", { name: "One" });
    expect(first).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel", { name: "One" });
    expect(panel).not.toHaveAttribute("hidden");
  });

  it("switches panel on click and emits onSelectedIndexChange", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<BasicTabs onSelectedIndexChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: "Two" }));
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel", { name: "Two" })).not.toHaveAttribute(
      "hidden",
    );
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("moves selection with arrow keys and skips disabled tabs", async () => {
    const user = userEvent.setup();
    render(<BasicTabs />);
    const first = screen.getByRole("tab", { name: "One" });
    first.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // Next ArrowRight skips disabled "Three" and wraps to "One".
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("supports Home and End keys", async () => {
    const user = userEvent.setup();
    render(<BasicTabs />);
    screen.getByRole("tab", { name: "Two" }).focus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // End walks back from past-the-end, skipping disabled "Three" to "Two".
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("does not select a disabled tab on click", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<BasicTabs onSelectedIndexChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: "Three" }));
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("works as a controlled component", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [index, setIndex] = useState(0);
      return (
        <Tabs
          ariaLabel="Sections"
          selectedIndex={index}
          onSelectedIndexChange={setIndex}
        >
          <Tab label="One">First panel</Tab>
          <Tab label="Two">Second panel</Tab>
        </Tabs>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("tab", { name: "Two" }));
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(<BasicTabs />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
