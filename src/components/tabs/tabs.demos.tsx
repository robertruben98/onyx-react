import type { ReactNode } from "react";
import { Tabs, Tab } from "./Tabs";

export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

export const tabsDemos: Demo[] = [
  {
    title: "Basic",
    render: () => (
      <Tabs ariaLabel="Account">
        <Tab label="Profile">Your public profile details.</Tab>
        <Tab label="Security">Password and two-factor settings.</Tab>
        <Tab label="Billing" disabled>
          Upgrade to manage billing.
        </Tab>
      </Tabs>
    ),
  },
];
