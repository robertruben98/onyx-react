import type { ReactNode } from "react";
import { Button } from "../button/Button";
import { Tooltip } from "./Tooltip";

export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

export const tooltipDemos: Demo[] = [
  {
    title: "Basic",
    render: () => (
      <>
        <Tooltip text="Saves your changes">
          <Button>Save</Button>
        </Tooltip>
        <Tooltip text="Discards the draft" placement="bottom">
          <Button variant="secondary">Cancel</Button>
        </Tooltip>
      </>
    ),
  },
  {
    title: "Placements",
    render: () => (
      <>
        <Tooltip text="Above" placement="top">
          <Button>Top</Button>
        </Tooltip>
        <Tooltip text="Below" placement="bottom">
          <Button>Bottom</Button>
        </Tooltip>
        <Tooltip text="To the left" placement="left">
          <Button>Left</Button>
        </Tooltip>
        <Tooltip text="To the right" placement="right">
          <Button>Right</Button>
        </Tooltip>
      </>
    ),
  },
];
