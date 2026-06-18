import type { Demo } from "../button/button.demos";
import { Button } from "../button/Button";
import { Popover } from "./Popover";

export const popoverDemos: Demo[] = [
  {
    title: "Basic",
    render: () => (
      <Popover
        label="Quick actions"
        content={
          <>
            <p>Choose an action for this item.</p>
            <button type="button">Rename</button>
            <button type="button">Delete</button>
          </>
        }
      >
        <Button>Actions</Button>
      </Popover>
    ),
  },
  {
    title: "Placement",
    description: "Anchor the popover above the trigger.",
    render: () => (
      <Popover
        placement="top"
        label="Details"
        content={<p>Rendered above the trigger.</p>}
      >
        <Button variant="secondary">Top</Button>
      </Popover>
    ),
  },
  {
    title: "Disabled",
    description: "A disabled popover never opens and emits no events.",
    render: () => (
      <Popover disabled content={<p>Never shown.</p>}>
        <Button disabled>Disabled</Button>
      </Popover>
    ),
  },
];
