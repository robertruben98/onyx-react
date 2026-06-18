# Onyx UI — React

Accessible, **token-themed** React components. A React 19 port of
[onyx-ng](https://github.com/robertruben98/onyx-ng) (Angular), sharing the exact
same design-token CSS — re-skin the whole library for a client by swapping one
preset, without touching a component.

## Install

```bash
npm install @onyx/react
```

## Usage

```tsx
import { Button } from "@onyx/react";

export function Demo() {
  return <Button onClicked={() => console.log("saved")}>Save</Button>;
}
```

The package imports its token stylesheet automatically. Components are styled
purely through CSS custom properties (`--ui-*`).

## Theming

The visual layer is the same framework-agnostic token CSS used by the Angular
library:

- **Dark mode** — add the class `app-dark` to a root element (e.g. `<html>`); it
  re-maps the semantic tokens.
- **Client preset** — add a preset class such as `ui-theme-acme`. A preset is one
  CSS file that re-maps semantic tokens; creating one never requires editing a
  component.

## Scripts

```bash
npm run build      # Vite library build (ESM)
npm test           # Vitest — interaction + jest-axe a11y
npm run typecheck  # tsc --noEmit
```

## Components

- `Button` — primary / secondary / text variants, sizes, disabled, loading.

_More components are ports of their onyx-ng counterparts and share the same API
shape (signal inputs become props, outputs become `on*` callbacks)._
