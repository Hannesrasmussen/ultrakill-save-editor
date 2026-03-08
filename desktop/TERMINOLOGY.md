# TERMINOLOGY

This document defines the terminology for the **Ultrakill Save Editor** project.

Its purpose is to keep naming consistent across:

- user interface text content
- internal code
- CLI commands
- documentation
- import and export workflows

When there is ambiguity, this document is the source of truth.

---

## Core Terms

### Save

A **Save** is the complete set of `.bepis` files contained inside one slot directory, such as `Saves/Slot1` or `Saves/Slot2`.

A Save is the main unit the editor works with.

The user can:

- import a Save
- load a Save
- edit a Save
- export a Save

A Save is **not** a single `.bepis` file.

---

### Save file

A **Save file** is one individual `.bepis` file within a Save.

Examples include files such as:

- `generalprogress.bepis`
- level-specific `.bepis` files
- other game-managed `.bepis` files inside the selected slot directory

A Save file is a technical sub-part of a Save.

---

### Save folder

A **Save folder** is the physical directory on disk that contains a Save.

For the current version of ULTRAKILL, this is one of:

- `Saves/Slot1`
- `Saves/Slot2`
- `Saves/Slot3`
- etc.

The Save folder is the filesystem location.
The Save is the data concept loaded from that location.

---

### Slot

A **Slot** is the game-level container name used by ULTRAKILL.

The game exposes multiple slots:

- `Slot1`
- `Slot2`
- `Slot3`
- etc.

In user-facing UI, prefer **Save** over **Slot** unless the literal folder path matters.

Use **Slot** mainly when referring to:

- filesystem paths
- technical implementation
- selecting between multiple slots

---

## User-Facing Language

The application should prefer these terms in the interface.

### Preferred

- Import Save
- Loaded Save
- Export Save
- Save folder
- Save files

### Avoid when possible

- Import slot
- Export slot
- Open bepis bundle
- Save archive

These are either too technical or less intuitive for users.

---

## Action Terms

### Import Save

Load a Save folder into the editor so its data can be viewed and modified.

In practice, this means selecting or detecting a slot folder such as `Saves/Slot1` and treating its contents as one Save.

---

### Load Save

Use this as a synonym for **Import Save** only when the context is clearly about opening data into the editor.

Prefer **Import Save** for primary UI actions.
Prefer **Loaded Save** for status text.

---

### Export Save

Write the currently edited Save out to a folder structure compatible with ULTRAKILL.

This may mean:

- writing back to an existing Save folder
- exporting to another folder for backup or sharing

---

### Apply Changes

Write edits from the editor model into the Save being worked on.

Use this when you want to distinguish between:

- editing data in memory
- actually writing the result to disk

---

## Data Model Language

For internal consistency, the project should model the domain like this:

- **Save** = complete editable unit
- **SaveFile** = one `.bepis` file inside the Save
- **SaveFolderPath** = filesystem path to the folder containing the Save
- **SlotName** = technical slot identifier such as `Slot1` or `Slot2`

Example naming:

- `loadedSave`
- `saveFiles`
- `saveFolderPath`
- `slotName`

Avoid naming one `.bepis` file simply `save`, because that causes ambiguity.

---

## Current Game Reality

At the time of writing, ULTRAKILL uses multiple save-slot folders (`Slot1`, `Slot2`, ...).

The editor should still present the concept as a **Save**, not as a hardcoded slot identity, so the interface remains understandable and future-proof.

---

## Project Definitions

Use these as the short-form reference.

### Save

The full set of `.bepis` files inside a slot folder such as `Saves/Slot1`.

### Save file

A single `.bepis` file inside that Save.

### Save folder

The physical slot directory on disk (for example `Saves/Slot1`).

### Slot

The game's technical slot identifier (for example `Slot1`).

---

## Environment / Detection Notes

### Active Steam account

ULTRAKILL save discovery depends on the currently active Steam account on the computer.

Changing Steam accounts can change which Steam userdata path is active, which in turn changes which Save folder the application detects.

The editor should detect this and inform the user which Steam account context is currently active when relevant to save discovery.

---

## Final Rule

When writing UI text, documentation, or code comments:

- prefer **Save** for the whole editable unit
- prefer **Save file** for an individual `.bepis` file
- prefer **Save folder** for the on-disk directory
- reserve **Slot** for technical and path-level references
