import type { ReactNode } from "react";
import { Card } from "./Card";

export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

export const cardDemos: Demo[] = [
  {
    title: "Basic",
    render: () => (
      <Card
        header={<strong>Project Atlas</strong>}
        footer={<span>Updated 2 hours ago</span>}
      >
        <p>A concise summary of the card body content goes here.</p>
      </Card>
    ),
  },
  {
    title: "Variants",
    render: () => (
      <>
        <Card variant="elevated">Elevated surface</Card>
        <Card variant="outlined">Outlined surface</Card>
      </>
    ),
  },
];
