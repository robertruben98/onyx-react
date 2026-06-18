import type { Demo } from "../button/button.demos";
import { Input } from "./Input";

export const inputDemos: Demo[] = [
  {
    title: "Basic",
    render: () => (
      <Input label="Email" placeholder="you@example.com" type="email" />
    ),
  },
  {
    title: "Sizes",
    render: () => (
      <>
        <Input size="sm" label="Small" placeholder="sm" />
        <Input size="md" label="Medium" placeholder="md" />
        <Input size="lg" label="Large" placeholder="lg" />
      </>
    ),
  },
  {
    title: "States",
    render: () => (
      <>
        <Input label="Invalid" invalid />
        <Input label="Disabled" disabled />
      </>
    ),
  },
];
