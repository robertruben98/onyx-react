import type { ReactNode } from "react";
import { Menu, type MenuItem } from "./Menu";

export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

const items: MenuItem[] = [
  { id: "edit", label: "Edit" },
  { id: "duplicate", label: "Duplicate" },
  { id: "archive", label: "Archive" },
  { id: "delete", label: "Delete", disabled: true },
];

export const menuDemos: Demo[] = [
  {
    title: "Basic",
    description:
      "Dropdown action menu. Open with click or ArrowDown; navigate with arrows; a disabled item never emits.",
    render: () => (
      <Menu items={items} onItemSelect={() => undefined}>
        Actions
      </Menu>
    ),
  },
];
