# ULTRAKILL Save CLI

Command-line backend for decoding, encoding, scanning, and grouped save decoding used by the desktop app.

## Requirements

- .NET SDK 8.0+
- Local ULTRAKILL installation

The CLI deserializes game save data, so it needs assemblies from your local ULTRAKILL install:

- `Assembly-CSharp.dll`
- `UnityEngine.CoreModule.dll`

Expected under:

```text
ULTRAKILL/ULTRAKILL_Data/Managed/
```

These assemblies are game files and are not distributed in this repository.

## Build

From repo root:

```bash
dotnet build cli/src
```

Or from `cli/src`:

```bash
dotnet build
```

## Commands

### `decode`

Decode one `.bepis` file to JSON.

```text
decode <input.bepis> <output.json>
```

### `encode`

Encode JSON back to a `.bepis` file.

```text
encode <input.json> <output.bepis>
```

### `scan`

Find ULTRAKILL saves and report detected slot files.

```text
scan
```

Output includes:

- selected slot summary (`slot`, `directory`, `levels`, `special`, `other`)
- all discovered slots under `slots[]`

### `decode-save [slotDirectory]`

Decode all `.bepis` files in a slot directory and return grouped JSON:

- `levels` (e.g. `lvl1progress.bepis` to `lvl99progress.bepis`)
- `special` (e.g. `lvl100progress.bepis`+)
- `other` (general/difficulty/etc)

If `slotDirectory` is omitted, the CLI auto-selects save slot using its locator rules.

## Notes

- This project operates on trusted local files only.
- ULTRAKILL save format may change across game updates.
- `BinaryFormatter` compatibility is required because Unity save data relies on it.
