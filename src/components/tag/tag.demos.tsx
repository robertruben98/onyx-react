import type { ReactNode } from "react";
import { Tag } from "./Tag";

export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

export const tagDemos: Demo[] = [
  {
    title: "Variants",
    render: () => (
      <>
        <Tag variant="neutral">Neutral</Tag>
        <Tag variant="info">Info</Tag>
        <Tag variant="success">Success</Tag>
        <Tag variant="warning">Warning</Tag>
        <Tag variant="danger">Danger</Tag>
      </>
    ),
  },
  {
    title: "Removable",
    description: "Shows a close button that emits onRemoved.",
    render: () => (
      <>
        <Tag variant="info" removable>
          React
        </Tag>
        <Tag variant="success" removable>
          Hooks
        </Tag>
      </>
    ),
  },
];
