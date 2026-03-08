# Ultrakill Save Editor

![GitHub release](https://img.shields.io/github/v/release/Hannesrasmussen/ultrakill-save-editor) ![Status](https://img.shields.io/badge/status-in%20development-orange)

![.NET](https://img.shields.io/badge/.NET-8.0-blue) ![Electron](https://img.shields.io/badge/Electron-active-brightgreen) ![License](https://img.shields.io/badge/license-MIT-green) ![GitHub repo size](https://img.shields.io/github/repo-size/Hannesrasmussen/ultrakill-save-editor) ![GitHub last commit](https://img.shields.io/github/last-commit/Hannesrasmussen/ultrakill-save-editor)

In-development desktop save editor for **ULTRAKILL** built with an Electron frontend and a C# CLI backend.

The repository currently contains both the desktop app and the CLI backend used to read/write save data.

> [!IMPORTANT]
> **ULTRAKILL** is designed as a skill-based game where overcoming its challenges is part of the intended experience. Skipping that process may cause players to miss out on what makes the game rewarding.
>
> This editor intentionally does **not** allow direct modification of **Cyber Grind scores** or **Speedrun times**, as these represent recorded gameplay performance and competitive achievements.
>
> Some progression values such as mission rank state remain editable, but editing is constrained to the rules the game uses for rank outcomes.
>
> This tool exists primarily for experimentation, debugging, and save inspection. Players are encouraged to try completing the game's challenges normally before modifying their saves.

## Table of Contents

- [Disclaimer](#disclaimer)
- [Scope](#scope)
- [Current Status](#current-status)
- [Mission Rank Behavior](#mission-rank-behavior)
- [Weapons Behavior](#weapons-behavior)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Development](#development)
  - [Development Requirements](#development-requirements)
  - [Run Locally](#run-locally)
- [Troubleshooting](#troubleshooting)
- [Related Projects](#related-projects)
- [License](#license)

## Disclaimer

This project is an independent tool for inspecting and modifying save files from the game **ULTRAKILL**.

ULTRAKILL and all related assets, screenshots, and trademarks are the property of their respective owners. This project is not affiliated with or endorsed by the developers or publishers of the game.

Screenshots used in the interface are included solely for identification and reference.

## Scope

The editor is focused on confirmed vanilla progression/state data.

Included:

- money / P
- mission progression
- mission stats and mission rank state
- secret mission state
- weapon and arm unlock flags
- weapon customization unlock flags
- equipped weapon preferences

Excluded unless confirmed later:

- selected cosmetic paint/color values
- skin selection data
- external palette files
- graphics/options config
- mod-specific cosmetic metadata

## Current Status

The desktop interface and CLI backend are both implemented.

Implemented "today":

- save slot scanning
- grouped save decoding (`levels`, `special`, `other`)
- mission editing (rank categories, derived mission rank, challenges, secrets)
- weapon editing (unlock/customization flags and equipped state) **Still kinda broken but will be further worked on**
- preferences writing with retry handling for file-lock errors
- ULTRAKILL process check to prevent editing while the game is open

## Mission Rank Behavior

Mission rank is derived from the category ranks and penalties.

- Category points: `D=1`, `C=2`, `B=3`, `A=4`, `S=5`
- Formula: `finalScore = time + kills + style - checkpointRestarts`
- Mapping:
  - `<= 4 => D`
  - `5..7 => C`
  - `8..10 => B`
  - `11..13 => A`
  - `14 => S`
  - `15 => P`, only when Major Assists are disabled

Additional rules:

- Checkpoint restarts subtract 1 point each.
- Cheats replace normal mission rank with `-`.
- `P` is not a separate weighted rank system; it is the 15-point case under the assists rule.

## Weapons Behavior

Weapons editing intentionally separates progression from cosmetics.

- Unlock/customization flags are edited from `.bepis` progression data.
- Equipped state is edited from `Preferences/Prefs.json`.
- Weapon family editing supports base unlock, alternate unlock, and equipped-state toggles.

Cosmetic appearance selection (paint/skin/palette configuration) remains out of scope until confirmed in vanilla save data.

## Architecture

The project is designed around a simple separation of responsibilities.

```text
Desktop UI (Electron + Vue)
      |
      v
Main process bridge
      |
      v
CLI backend (.NET)
      |
      v
ULTRAKILL save data (.bepis + Prefs.json)
```

The CLI handles save decoding/encoding/scan logic. The Electron application provides UI and orchestrates editing operations.

## Repository Structure

```text
ultrakill-save-editor/
  cli/
    src/
      Commands/
      Program.cs
      README.md
  desktop/
    main/
    preload/
    renderer/
```

The CLI project lives in `cli/src`. The Electron frontend lives in `desktop`.

## Development

The CLI is written in **C#** and targets **.NET 8**.

The desktop app is built with **Electron + Vue** and calls the CLI internally for save operations.

### Development Requirements

The following tools are required for development:

- .NET SDK capable of building **net8.0** (for example .NET 8 or later)
- A local installation of **ULTRAKILL**
- Node.js and pnpm (for the desktop app)

Development requires access to the following assemblies from a local ULTRAKILL installation:

```text
Assembly-CSharp.dll
UnityEngine.CoreModule.dll
```

These files are part of the game distribution and are therefore **not included in this repository**.

### Run Locally

Build the CLI:

```bash
dotnet build cli/src
```

Install desktop dependencies:

```bash
pnpm --dir desktop install
```

Run the desktop app in dev mode:

```bash
pnpm --dir desktop dev
```

## Troubleshooting

### The tool cannot find ULTRAKILL

The locator attempts to find the game in common Steam install paths. If ULTRAKILL is installed in a non-standard location, automatic detection may fail.

### Preferences write error (`EBUSY`, `EPERM`, `EACCES`)

This usually means ULTRAKILL or Steam Cloud activity is locking `Preferences/Prefs.json`.

- Close ULTRAKILL.
- Retry the operation.
- Restart the editor if needed.

The desktop app will also block editing when `ULTRAKILL.exe` is detected as running.

### Save files become corrupted

Always keep backups of your save files before modifying them.

The tool attempts to reconstruct the original save format as closely as possible, but the format is controlled by the game and may change in future updates.

### The game updated and the editor stopped working

ULTRAKILL is still in development and changes to the save format may occur.

If this happens, the editor may need to be updated to support the new format.

---

## Related Projects

An older project with the same name exists but has since been archived and is no longer maintained. That project was created by [PyPylia](https://github.com/PyPylia) and can be found here:

https://github.com/PyPylia/ultrakill-save-editor

This repository is a new and independent implementation and is not related to the original project.

---

## License

The source code in this repository is released under the **MIT License**. See [LICENSE](LICENSE) for details.

### License Scope

- The MIT license applies to this project's original source code.
- ULTRAKILL assets (including screenshots, icons, textures, sprites, and trademarks) are **not** covered by MIT and remain the property of their respective owners.
- See the asset notices in:
  - [desktop/renderer/public/README.md](desktop/renderer/public/README.md)
  - [desktop/renderer/public/mission-screenshots/README.md](desktop/renderer/public/mission-screenshots/README.md)
  - [desktop/renderer/public/weapon-icons/README.md](desktop/renderer/public/weapon-icons/README.md)
