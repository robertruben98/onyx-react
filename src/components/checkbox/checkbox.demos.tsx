import type { Demo } from "../button/button.demos";
import { Checkbox } from "./Checkbox";

export const checkboxDemos: Demo[] = [
  {
    title: "Basic",
    render: () => <Checkbox label="Accept terms" />,
  },
  {
    title: "States",
    description: "Indeterminate and disabled checkboxes.",
    render: () => (
      <>
        <Checkbox label="Indeterminate" indeterminate />
        <Checkbox label="Disabled" disabled />
      </>
    ),
  },
];
