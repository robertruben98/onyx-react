import { useState } from "react";
import { Switch } from "./Switch";
import type { Demo } from "../button/button.demos";

function ControlledSwitch() {
  const [checked, setChecked] = useState(false);
  return (
    <Switch
      label="Enable notifications"
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}

export const switchDemos: Demo[] = [
  {
    title: "Basic",
    render: () => <Switch label="Enable notifications" />,
  },
  {
    title: "Controlled",
    description: "Two-way value via `checked` + `onCheckedChange`.",
    render: () => <ControlledSwitch />,
  },
  {
    title: "Disabled",
    description: "A disabled switch never emits onCheckedChange.",
    render: () => <Switch label="Disabled" disabled />,
  },
  {
    title: "Invalid",
    description: "Reflected via aria-invalid.",
    render: () => <Switch label="Accept terms" invalid />,
  },
];
