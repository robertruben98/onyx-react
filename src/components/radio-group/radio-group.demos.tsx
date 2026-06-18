import { useState } from "react";
import type { ReactNode } from "react";
import { RadioGroup, type RadioOption } from "./RadioGroup";

export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

const sizeOptions: RadioOption[] = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

function ControlledDemo() {
  const [value, setValue] = useState("md");
  return (
    <RadioGroup
      label="Size"
      options={sizeOptions}
      value={value}
      onValueChange={setValue}
    />
  );
}

export const radioGroupDemos: Demo[] = [
  {
    title: "Basic",
    render: () => <RadioGroup label="Size" options={sizeOptions} />,
  },
  {
    title: "Controlled",
    description: "Two-way binding via value + onValueChange.",
    render: () => <ControlledDemo />,
  },
  {
    title: "Disabled option",
    render: () => (
      <RadioGroup
        label="Size"
        options={[
          ...sizeOptions,
          { label: "X-Large", value: "xl", disabled: true },
        ]}
      />
    ),
  },
  {
    title: "Disabled group",
    description: "A disabled group never emits onValueChange.",
    render: () => <RadioGroup label="Size" options={sizeOptions} disabled />,
  },
  {
    title: "Invalid",
    description: "Reflected via aria-invalid.",
    render: () => <RadioGroup label="Size" options={sizeOptions} invalid />,
  },
];
