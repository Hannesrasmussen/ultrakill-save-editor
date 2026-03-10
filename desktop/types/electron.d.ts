export {};

interface SaveSlotScanResult {
  slot: string;
  directory: string;
  levels: number[];
  special: number[];
  other: string[];
}

interface SaveScanResult {
  savesDirectory: string | null;
  slot: string | null;
  directory: string | null;
  levels: number[];
  special: number[];
  other: string[];
  slots: SaveSlotScanResult[];
}

interface ReadPreferencesResult {
  path: string | null;
  data: Record<string, unknown> | null;
}

interface DecodedSavePayload {
  directory: string;
  levels: Record<string, unknown>;
  special: Record<string, unknown>;
  other: Record<string, unknown>;
}

interface CliOutputEventPayload {
  command: string;
  args: string[];
  stream: "stdout" | "stderr";
  text: string;
  timestamp: number;
}

interface UpdateAvailablePayload {
  currentVersion: string;
  latestVersion: string;
  releaseUrl: string;
}

declare global {
  interface Window {
    api: {
      ping: () => string;
      scan: () => Promise<SaveScanResult>;
      decode: (slotDirectory?: string) => Promise<DecodedSavePayload>;
      isUltrakillRunning: () => Promise<boolean>;
      readPreferences: (
        slotDirectory?: string,
      ) => Promise<ReadPreferencesResult>;
      writePreferences: (
        slotDirectory: string,
        data: Record<string, unknown>,
      ) => Promise<{ path: string }>;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      getZoomFactor: () => Promise<number>;
      setZoomFactor: (factor: number) => Promise<number>;
      resetZoomFactor: () => Promise<number>;
      openExternal: (url: string) => Promise<{ ok: true }>;
      onUpdateAvailable: (
        callback: (payload: UpdateAvailablePayload) => void,
      ) => () => void;
      onZoomChanged: (callback: (factor: number) => void) => () => void;
      onCliOutput: (
        callback: (payload: CliOutputEventPayload) => void,
      ) => () => void;
    };
  }
}
