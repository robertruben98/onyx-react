import type { ReactNode } from "react";
import { Spinner } from "./Spinner";

export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

export const spinnerDemos: Demo[] = [
  {
    title: "Sizes",
    render: () => (
      <>
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </>
    ),
  },
];
