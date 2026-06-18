import type { ReactNode } from "react";
import { ProgressBar } from "./ProgressBar";

export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

export const progressBarDemos: Demo[] = [
  {
    title: "Determinate",
    render: () => (
      <>
        <ProgressBar value={25} label="Step 1 of 4" />
        <ProgressBar value={70} label="Upload" />
      </>
    ),
  },
  {
    title: "Indeterminate",
    description: "Unknown-progress mode.",
    render: () => <ProgressBar indeterminate label="Loading" />,
  },
];
