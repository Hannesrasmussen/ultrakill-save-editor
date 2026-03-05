# Ultrakill Save CLI

Ultrakill Save CLI is a small command line utility used to read and write save files from the game.

The tool converts the game's binary save files (`.bepis`) into a readable JSON representation and can also reconstruct valid save files from edited JSON data. It exists primarily as a backend component for the graphical save editor, but it can also be used directly for testing and debugging.

The CLI is responsible only for serialization logic. User interaction and editing is handled by the frontend.

---

## Requirements

The save files used by ULTRAKILL contain serialized .NET objects defined in the game's assemblies. In order to deserialize these objects correctly, the tool loads the required assemblies from the user's installation of the game.

The following files must be present in the ULTRAKILL installation:

```
Assembly-CSharp.dll
UnityEngine.CoreModule.dll
```

These files are normally located in:

```
ULTRAKILL/ULTRAKILL_Data/Managed/
```

The CLI attempts to locate the installation automatically. The assemblies are **not included in this repository** for legal reasons.

---

## Building

The project targets **.NET 8**.

From the repository root you can build the CLI with:

```
dotnet build cli/src
```

Or from inside the CLI source directory:

```
cd cli/src
dotnet build
```

To run the tool during development:

```
dotnet run <command> [arguments]
```

---

## Commands

### decode

Reads a `.bepis` save file and writes its contents as JSON.

```
decode <input.bepis> <output.json>
```

Example:

```
dotnet run decode lvl1progress.bepis output.json
```

The resulting JSON file contains the fields of the serialized save object and can be inspected or edited manually.

---

### encode

Creates a `.bepis` save file from a JSON representation.

```
encode <input.json> <output.bepis>
```

Example:

```
dotnet run encode output.json modified.bepis
```

The produced file can replace an existing save file.

---

### scan

Attempts to locate the ULTRAKILL save directory and list detected save files.

```
scan
```

Example:

```
dotnet run scan
```

The command prints a JSON structure describing the detected save directory and available save files.

Example output:

```
{
  "directory": ".../ULTRAKILL/Saves/Slot1",
  "levels": [1,2,3,4],
  "special": [666],
  "other": [
    "generalprogress.bepis",
    "difficultyProgress.bepis"
  ]
}
```

---

## Architecture

The CLI is intentionally small and divided into a few focused components.

```
cli
└── src
    ├── Commands
    │   ├── Decoder.cs
    │   ├── Encoder.cs
    │   ├── Locator.cs
    │   └── AssemblyLocator.cs
    │
    ├── Program.cs
    ├── cli.csproj
    └── cli.sln
```

### Program

`Program.cs` is the entry point of the application. It parses command line arguments and routes execution to the appropriate command.

### Decoder

Responsible for converting `.bepis` files into JSON.

The decoder loads the required game assemblies and uses `BinaryFormatter` to deserialize the save data.

### Encoder

Responsible for reconstructing `.bepis` files from JSON data.

The encoder recreates the serialized object structure and writes the result using the same formatter used by the game.

### Locator

Detects the ULTRAKILL save directory and enumerates available save files.

### AssemblyLocator

Locates the required ULTRAKILL assemblies and loads them once during execution.

---

## Notes

The project targets **.NET 8.0**.

ULTRAKILL save files are serialized using the legacy .NET `BinaryFormatter`.
Although this API is considered obsolete in modern .NET development, it is still required in order to deserialize Unity save files created by the game.

Newer versions of .NET have removed or restricted parts of the formatter serialization system. Targeting .NET 8 ensures compatibility with the serialization APIs required to read and reconstruct the save data.

The CLI is intended to operate only on **trusted local save files**.
