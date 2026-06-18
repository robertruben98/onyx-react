import { useState, type ReactNode } from "react";
import { Textarea } from "./Textarea";

export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

function BasicDemo() {
  const [value, setValue] = useState("");
  return (
    <Textarea
      label="Bio"
      placeholder="Tell us about yourself…"
      rows={3}
      value={value}
      onValueChange={setValue}
    />
  );
}

export const textareaDemos: Demo[] = [
  {
    title: "Basic",
    render: () => <BasicDemo />,
  },
  {
    title: "Invalid",
    description: "Reflected via aria-invalid and invalid styling.",
    render: () => <Textarea label="Bio" invalid rows={3} />,
  },
  {
    title: "Disabled",
    description: "A disabled textarea never emits onValueChange.",
    render: () => <Textarea label="Bio" disabled rows={3} value="Read only" />,
  },
];
