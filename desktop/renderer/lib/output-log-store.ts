import { ref } from "vue";

export type OutputSource = "frontend" | "cli";
export type OutputLevel = "log" | "info" | "warn" | "error" | "debug";

export interface OutputLogEntry {
  id: number;
  source: OutputSource;
  level: OutputLevel;
  text: string;
  timestamp: number;
}

const MAX_LOG_ENTRIES = 500;

export const frontendOutputEntries = ref<OutputLogEntry[]>([]);
export const cliOutputEntries = ref<OutputLogEntry[]>([]);

let outputLogSequence = 0;
let consoleCaptureInstalled = false;

function nextEntryId() {
  outputLogSequence += 1;
  return outputLogSequence;
}

function addEntry(
  target: { value: OutputLogEntry[] },
  entry: Omit<OutputLogEntry, "id">,
) {
  const next = [...target.value, { ...entry, id: nextEntryId() }];
  if (next.length > MAX_LOG_ENTRIES) {
    next.splice(0, next.length - MAX_LOG_ENTRIES);
  }
  target.value = next;
}

function stringifyArgs(args: unknown[]) {
  return args
    .map((value) => {
      if (typeof value === "string") {
        return value;
      }

      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    })
    .join(" ");
}

export function appendFrontendOutput(level: OutputLevel, ...args: unknown[]) {
  addEntry(frontendOutputEntries, {
    source: "frontend",
    level,
    text: stringifyArgs(args),
    timestamp: Date.now(),
  });
}

export function appendCliOutput(
  level: OutputLevel,
  text: string,
  timestamp = Date.now(),
) {
  addEntry(cliOutputEntries, {
    source: "cli",
    level,
    text,
    timestamp,
  });
}

export function clearOutputLogs() {
  frontendOutputEntries.value = [];
  cliOutputEntries.value = [];
}

export function installFrontendConsoleCapture() {
  if (consoleCaptureInstalled) {
    return;
  }

  consoleCaptureInstalled = true;
  const targets: OutputLevel[] = ["log", "info", "warn", "error", "debug"];

  for (const level of targets) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      appendFrontendOutput(level, ...args);
      original(...args);
    };
  }
}
