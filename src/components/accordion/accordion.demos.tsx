import type { Demo } from "../button/button.demos";
import { Accordion, AccordionItem } from "./Accordion";

export const accordionDemos: Demo[] = [
  {
    title: "Single",
    description: "Single-open by default — expanding one collapses the rest.",
    render: () => (
      <Accordion>
        <AccordionItem heading="Shipping">
          Free over $50, 2–4 business days.
        </AccordionItem>
        <AccordionItem heading="Returns">
          30-day window, original packaging.
        </AccordionItem>
        <AccordionItem heading="Warranty">
          Two years against defects.
        </AccordionItem>
      </Accordion>
    ),
  },
  {
    title: "Multiple",
    description: "Set multi to allow several sections open at once.",
    render: () => (
      <Accordion multi>
        <AccordionItem heading="Section A">Open several at once.</AccordionItem>
        <AccordionItem heading="Section B">
          Multi mode is enabled.
        </AccordionItem>
      </Accordion>
    ),
  },
  {
    title: "Disabled",
    description: "A disabled item never toggles.",
    render: () => (
      <Accordion>
        <AccordionItem heading="Available">Toggle me.</AccordionItem>
        <AccordionItem heading="Unavailable" disabled>
          Cannot open.
        </AccordionItem>
      </Accordion>
    ),
  },
];
