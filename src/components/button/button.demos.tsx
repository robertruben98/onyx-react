import type { ReactNode } from "react";
import { Button } from "./Button";

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
