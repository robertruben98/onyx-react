import { useState, type ReactNode } from "react";
import { Button } from "../button";
import { Dialog } from "./Dialog";

export interface Demo {
  title: string;
  description?: string;
  render: () => ReactNode;
}

function BasicDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClicked={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        heading="Confirm action"
        footer={
          <>
            <Button variant="secondary" onClicked={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClicked={() => setOpen(false)}>Confirm</Button>
          </>
        }
      >
        <p>This action cannot be undone. Do you want to continue?</p>
      </Dialog>
    </>
  );
}

function SizesDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClicked={() => setOpen(true)}>
        Open large dialog
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        heading="Terms"
        size="lg"
      >
        <p>A wider panel for long-form content.</p>
      </Dialog>
    </>
  );
}

export const dialogDemos: Demo[] = [
  {
    title: "Basic",
    description: "Heading, body and a footer with actions.",
    render: () => <BasicDemo />,
  },
  {
    title: "Sizes",
    description: "Panel width is token-driven via the size prop.",
    render: () => <SizesDemo />,
  },
];
