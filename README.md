# Ultrakill Save Editor

![.NET](https://img.shields.io/badge/.NET-8.0-blue) ![Electron](https://img.shields.io/badge/Electron-planned-lightgrey) ![License](https://img.shields.io/badge/license-MIT-green) ![GitHub repo size](https://img.shields.io/github/repo-size/Hannesrasmussen/ultrakill-save-editor) ![GitHub last commit](https://img.shields.io/github/last-commit/Hannesrasmussen/ultrakill-save-editor)

Desktop save editor for **ULTRAKILL** built with an Electron frontend and a C# CLI backend.

The project is currently in early development. The repository currently contains the backend CLI responsible for reading and writing the game's save files. A graphical interface will be added later.

---

## Disclaimer

This project is an independent tool for inspecting and modifying save files from the game **ULTRAKILL**.

ULTRAKILL and all related assets, screenshots, and trademarks are the property of their respective owners. This project is not affiliated with or endorsed by the developers or publishers of the game.

Screenshots used in the interface are included solely for identification and reference.

---

## Current Status

At the moment the repository contains the save file backend implemented as a CLI tool.

The CLI can:

- decode ULTRAKILL save files into JSON
- reconstruct save files from edited JSON
- locate installed save files automatically

A graphical desktop interface will later be implemented using **Electron**.

---

## Architecture

The project is designed around a simple separation of responsibilities.

```id="c6f43y"
Electron UI
      │
      ▼
CLI backend
      │
      ▼
ULTRAKILL save files (.bepis)
```

The CLI handles all serialization logic. The Electron application will provide the user interface and call the CLI internally.

---

## Repository Structure

```id="k3sntb"
ultrakill-save-editor
│
├── cli
│   └── src
│       ├── Commands
│       │   ├── Decoder.cs
│       │   ├── Encoder.cs
│       │   ├── Locator.cs
│       │   └── AssemblyLocator.cs
│       │
│       ├── Program.cs
│       ├── cli.csproj
│       ├── cli.sln
│       └── README.md
│
├── electron
└── dev
```

The CLI project lives in `cli/src`. The Electron frontend will be developed in the `electron` directory.

---

## Development

The CLI is written in **C#** and targets **.NET 8**.

A graphical interface will later be implemented using **Electron**. The frontend will act as the user interface and internally call the CLI for all save file operations.

The codebase aims to remain small and straightforward, with most explanation living in the README rather than extensive inline comments.

### Development Requirements

The following tools are required for development:

- .NET SDK capable of building **net8.0** (for example .NET 8 or later)
- A local installation of **ULTRAKILL**
- Node.js (required later for the Electron frontend)

Development requires access to the following assemblies from a local ULTRAKILL installation:

```id="l0uv9x"
Assembly-CSharp.dll
UnityEngine.CoreModule.dll
```

These files are part of the game distribution and are therefore **not included in this repository**.

---

## Contributing

Contributions are welcome.

If you find a bug or have an improvement in mind, feel free to open an issue or submit a pull request.

Please keep changes small and focused. The goal of the project is to keep the codebase straightforward and easy to understand.

Low-effort or automated pull requests that do not meaningfully improve the project will be closed. Repeated spam submissions may result in the user being blocked from contributing.

---

## Troubleshooting

### The tool cannot find ULTRAKILL

The CLI attempts to locate the game installation automatically. If the game is installed in a non-standard location or in a secondary Steam library, the automatic detection may fail.

Support for additional library locations may be added later.

---

### Save files become corrupted

Always keep backups of your save files before modifying them. The UI will attempt to encourage this once the graphical interface is implemented.

The tool attempts to reconstruct the original save format as closely as possible, but the format is controlled by the game and may change in future updates. If this happens, the editor may need to be updated accordingly.

---

### The game updated and the editor stopped working

ULTRAKILL is still in development and changes to the save format may occur.

If this happens the editor may need to be updated to support the new format.

---

## Related Projects

An older project with the same name exists but has since been archived and is no longer maintained. That project was created by [PyPylia](https://github.com/PyPylia) and can be found here:

https://github.com/PyPylia/ultrakill-save-editor

This repository is a new and independent implementation and is not related to the original project.

---

## License

This project is released under the **MIT License**. See the LICENSE file for details.
