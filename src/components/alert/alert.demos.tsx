import type { Demo } from "../button/button.demos";
import { Alert } from "./Alert";

export const alertDemos: Demo[] = [
  {
    title: "Variants",
    render: () => (
      <>
        <Alert variant="info" title="Info">
          An informational message.
        </Alert>
        <Alert variant="success" title="Success">
          It worked.
        </Alert>
        <Alert variant="warning" title="Warning">
          Careful now.
        </Alert>
        <Alert variant="danger" title="Error">
          Something broke.
        </Alert>
      </>
    ),
  },
  {
    title: "Dismissible",
    render: () => (
      <Alert variant="info" dismissible>
        Dismiss me.
      </Alert>
    ),
  },
];
