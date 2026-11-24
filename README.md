# Sunfall Heat

[![make.fun bounty](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![rank](https://make.fun/badge/gta6-01/mhmmdzildan03/sunfall-heat/rank.svg)](https://make.fun/bounty/gta6-01)
[![reward](https://make.fun/badge/gta6-01/mhmmdzildan03/sunfall-heat/reward.svg)](https://make.fun/bounty/gta6-01)

**Sunfall Heat** is a complete top-down 2D open-world crime game set in **Sunfall City**, a bright tropical city with three named districts — Marina Strip, Old Market, and Harbor Point — plus Palm Heights, a sandy beach and a turquoise sea. You play **Raka**, a street courier rising through the city by stealing cars, running deliveries and outrunning the police.

## Features

- **Open world on foot and by car** — a full road grid with markings, crosswalks, sidewalks, pastel buildings with slanted shadows, palm trees, a beach and a harbour pier
- **Traffic and pedestrians** — two-way traffic AI that follows the roads and turns at junctions, parked cars, and sidewalk pedestrians who flee from danger
- **Steal and drive any car** — press E near a car to take it; the first steal raises your wanted level
- **Wanted system (1–5 stars)** — police cars and foot officers chase you; hide to cool the heat, get caught and you are BUSTED, lose all health and you are WASTED
- **Three story missions with dialogue** — *First Wheels* (steal the teal sports car and deliver it to Harbor Point), *Hot Delivery* (a cross-city package run while the heat rises), and *Harbor Job* (reach the pier, then vanish until your stars fade), each paying cash
- **Combat** — fists with F and a mouse-aimed pistol (click to shoot) with bullets and hit effects
- **HUD with live minimap** — roads, player, police, traffic and the mission marker, plus wanted stars, money, health bar, weapon indicator, objective banner and toasts
- **Sound** — a small WebAudio synth for shots, sirens, cash and mission jingles (M to mute)
- **Save / Continue** — money, completed missions and position persist in localStorage
- **Deterministic screenshot mode** — `?shot=start|drive|chase|mission&seed=N` stages frozen, seeded scenes

## Controls

- **WASD / Arrow keys** — walk and drive
- **Shift** — run
- **E** — enter / steal / exit a car
- **Space** — handbrake
- **Mouse** — aim, **Click** — shoot (on foot), advance dialogue, press menu buttons
- **F** — punch
- **P** — pause, **M** — mute

## Play locally

Requires Node.js 22 or later. From the repository root:

```
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no network requests — every file is served from `game/`.

## Entry

Built for the make.fun bounty [gta6-01](https://make.fun/bounty/gta6-01). The hand-in program is `main.ts`: run `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` to copy `game/` and `screenshots/` into `out/` and write `out/dossier.json`.

---

Play and discover more bounties: https://make.fun/?ref=n8m845w8&utm_source=github&utm_medium=readme&utm_campaign=gta6-01
