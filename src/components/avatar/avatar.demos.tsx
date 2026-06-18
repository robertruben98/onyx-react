import type { ReactNode } from "react";
import { Avatar } from "./Avatar";

export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

export const avatarDemos: Demo[] = [
  {
    title: "Initials & shape",
    render: () => (
      <>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" shape="square" />
      </>
    ),
  },
  {
    title: "Sizes",
    render: () => (
      <>
        <Avatar size="sm" name="Ada Lovelace" />
        <Avatar size="md" name="Ada Lovelace" />
        <Avatar size="lg" name="Ada Lovelace" />
      </>
    ),
  },
];
