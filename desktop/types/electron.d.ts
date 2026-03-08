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

declare global {
  interface Window {
    api: {
      ping: () => string;
      scan: () => Promise<SaveScanResult>;
      decode: (slotDirectory?: string) => Promise<any>;
      isUltrakillRunning: () => Promise<boolean>;
      readPreferences: (slotDirectory?: string) => Promise<ReadPreferencesResult>;
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
      onZoomChanged: (callback: (factor: number) => void) => () => void;
    };
  }
}
