import type { ReactNode } from "react";
import { Button } from "./Button";

/**
 * Canonical doc-harness demo descriptor. Button is the single owner of this
 * type; other components import it from `../button` so the name is exported by
 * exactly one module in the root barrel (avoids TS2308 ambiguity).
 */
export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

export const buttonDemos: Demo[] = [
  {
    title: "Variants",
    render: () => (
      <>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="text">Text</Button>
      </>
    ),
  },
  {
    title: "Sizes",
    render: () => (
      <>
        <Button size="sm">Small</Button>
        <Button>Medium</Button>
        <Button size="lg">Large</Button>
      </>
    ),
  },
  {
    title: "Disabled",
    description: "A disabled button never emits onClicked.",
    render: () => <Button disabled>Disabled</Button>,
  },
  {
    title: "Loading",
    description: "Shows a spinner and suppresses interaction.",
    render: () => <Button loading>Loading</Button>,
  },
];
