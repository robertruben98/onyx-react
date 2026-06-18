import type { ReactNode } from "react";
import { Divider } from "./Divider";

export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

export const dividerDemos: Demo[] = [
  {
    title: "Basic",
    render: () => (
      <>
        <p>Above</p>
        <Divider />
        <p>Below</p>
      </>
    ),
  },
  {
    title: "With label",
    description: "Optional centered label (horizontal).",
    render: () => <Divider label="OR" />,
  },
  {
    title: "Vertical",
    render: () => (
      <span style={{ display: "inline-flex", height: "2rem" }}>
        <span>Left</span>
        <Divider orientation="vertical" />
        <span>Right</span>
      </span>
    ),
  },
];
