import type { ReactNode } from "react";
import { Badge } from "./Badge";

export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

export const badgeDemos: Demo[] = [
  {
    title: "Variants",
    render: () => (
      <>
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="danger">Danger</Badge>
      </>
    ),
  },
];
