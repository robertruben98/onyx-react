import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../src/styles/index.css";

import { accordionDemos } from "../src/components/accordion/accordion.demos";
import { alertDemos } from "../src/components/alert/alert.demos";
import { avatarDemos } from "../src/components/avatar/avatar.demos";
import { badgeDemos } from "../src/components/badge/badge.demos";
import type { Demo } from "../src/components/button/button.demos";
import { buttonDemos } from "../src/components/button/button.demos";
import { cardDemos } from "../src/components/card/card.demos";
import { checkboxDemos } from "../src/components/checkbox/checkbox.demos";
import { dataTableDemos } from "../src/components/data-table/data-table.demos";
import { dialogDemos } from "../src/components/dialog/dialog.demos";
import { dividerDemos } from "../src/components/divider/divider.demos";
import { inputDemos } from "../src/components/input/input.demos";
import { menuDemos } from "../src/components/menu/menu.demos";
import { popoverDemos } from "../src/components/popover/popover.demos";
import { progressBarDemos } from "../src/components/progress-bar/progress-bar.demos";
import { radioGroupDemos } from "../src/components/radio-group/radio-group.demos";
import { selectDemos } from "../src/components/select/select.demos";
import { spinnerDemos } from "../src/components/spinner/spinner.demos";
import { switchDemos } from "../src/components/switch/switch.demos";
import { tabsDemos } from "../src/components/tabs/tabs.demos";
import { tagDemos } from "../src/components/tag/tag.demos";
import { textareaDemos } from "../src/components/textarea/textarea.demos";
import { tooltipDemos } from "../src/components/tooltip/tooltip.demos";

const groups: { name: string; demos: Demo[] }[] = [
  { name: "Accordion", demos: accordionDemos },
  { name: "Alert", demos: alertDemos },
  { name: "Avatar", demos: avatarDemos },
  { name: "Badge", demos: badgeDemos },
  { name: "Button", demos: buttonDemos },
  { name: "Card", demos: cardDemos },
  { name: "Checkbox", demos: checkboxDemos },
  { name: "Data table", demos: dataTableDemos },
  { name: "Dialog", demos: dialogDemos },
  { name: "Divider", demos: dividerDemos },
  { name: "Input", demos: inputDemos },
  { name: "Menu", demos: menuDemos },
  { name: "Popover", demos: popoverDemos },
  { name: "Progress bar", demos: progressBarDemos },
  { name: "Radio group", demos: radioGroupDemos },
  { name: "Select", demos: selectDemos },
  { name: "Spinner", demos: spinnerDemos },
  { name: "Switch", demos: switchDemos },
  { name: "Tabs", demos: tabsDemos },
  { name: "Tag", demos: tagDemos },
  { name: "Textarea", demos: textareaDemos },
  { name: "Tooltip", demos: tooltipDemos },
];

function App() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.25rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>Onyx React</h1>
      <p style={{ opacity: 0.7, marginTop: 0 }}>
        Accessible, token-themed React 19 components — {groups.length} components.
      </p>
      {groups.map((g) => (
        <section key={g.name} style={{ margin: "2.5rem 0" }}>
          <h2 style={{ borderBottom: "1px solid rgba(128,128,128,0.25)", paddingBottom: "0.35rem" }}>{g.name}</h2>
          {g.demos.map((d, i) => (
            <div key={i} style={{ margin: "1.25rem 0" }}>
              <h3 style={{ fontSize: "0.95rem", opacity: 0.75, fontWeight: 600 }}>{d.title}</h3>
              {d.description ? <p style={{ opacity: 0.6, fontSize: "0.85rem" }}>{d.description}</p> : null}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                {d.render()}
              </div>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
