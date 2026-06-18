import { useState } from "react";
import type { ReactNode } from "react";
import { Select, type SelectOption } from "./Select";

export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

const OPTIONS: SelectOption[] = [
  { value: "ng", label: "Angular" },
  { value: "rx", label: "RxJS" },
  { value: "sd", label: "Style Dictionary" },
  { value: "nx", label: "Nx", disabled: true },
];

function BasicSelect() {
  const [value, setValue] = useState<string | null>(null);
  return <Select options={OPTIONS} value={value} onChange={setValue} />;
}

export const selectDemos: Demo[] = [
  {
    title: "Basic",
    description:
      "Single-select dropdown with a disabled option; two-way value via onChange.",
    render: () => <BasicSelect />,
  },
  {
    title: "Disabled",
    description: "A disabled control never opens or emits.",
    render: () => <Select options={OPTIONS} disabled />,
  },
];
