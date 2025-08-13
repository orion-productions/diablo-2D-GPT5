# Diablo‑2D‑GPT5 (Web)

Local dev
- Node 20+: npm i; npm run dev
- Open the printed localhost URL (5173/5174/5175)

Controls
- Move: WASD / Arrows
- Cast magic: Space / Enter (toward mouse)
- Melee: B key / Controller B (east)
- Inventory: I (click items to equip)
- Open chest: E (near chest)

Features
- PixiJS renderer, pixel‑perfect scaling (16×16 assets scaled 3×)
- World checkerboard placeholder, camera follow
- Player input (keyboard + Gamepad API)
- Combat: projectiles, melee, enemy HP bar with 3s persist
- Loot: chest spawns on enemy death; opening grants 100 gold
- UI: Inventory overlay (top‑left), minimap (top‑right)

Assets
- Place art/audio under public/assets (see public/assets/README.txt)
- Suggested packs: 0x72 Dungeon Tileset II (16×16), Kenney assets

Build
- npm run build → outputs to dist/

Deploy (GitHub Pages)
- Workflow: .github/workflows/pages.yml
- Repo Settings → Pages → Source: GitHub Actions
- Site: https://orion-productions.github.io/diablo-2D-GPT5/