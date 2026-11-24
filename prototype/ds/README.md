# BigBase Design System (vendored)

Copied from `BigBase Design System-2.zip` for the Appwrite Canaries shell prototype.

| File | Role |
|------|------|
| `colors_and_type.css` | Tokens (neutral ramp, indigo brand, 12 month themes, dark mode, Inter + Fira Code) |
| `components.css` | Component classes (`btn`, `card`, `sidebar`, `app-footer`, `tabs`, …) |
| `canary-layout.css` | Canary-only layout (landing split, console chrome, `[data-accent="canary"]` pink exception) |
| `assets/bigbase-logo.svg` | Brand mark |

**Theme keys:** `localStorage['bigbase-color-mode']`, `localStorage['bigbase-theme']` (`default` = indigo, `canary` = Appwrite pink, or month id).

To refresh from the zip:

```bash
unzip -o -q "$HOME/Downloads/BigBase Design System-2.zip" \
  colors_and_type.css components.css assets/bigbase-logo.svg \
  -d "$(dirname "$0")"
```

Run the prototype from `prototype/` so relative `ds/*` paths resolve:

```bash
cd prototype && python3 -m http.server 8765
```