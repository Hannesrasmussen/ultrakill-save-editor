import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  ping: () => "pong",
  scan: () => ipcRenderer.invoke("scan-saves"),
  decode: (slotDirectory?: string) =>
    ipcRenderer.invoke("decode-save", slotDirectory),
  isUltrakillRunning: () => ipcRenderer.invoke("is-ultrakill-running"),
  readPreferences: (slotDirectory?: string) =>
    ipcRenderer.invoke("read-preferences", slotDirectory),
  writePreferences: (slotDirectory: string, data: Record<string, unknown>) =>
    ipcRenderer.invoke("write-preferences", slotDirectory, data),
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  getZoomFactor: () => ipcRenderer.invoke("window-get-zoom-factor"),
  setZoomFactor: (factor: number) =>
    ipcRenderer.invoke("window-set-zoom-factor", factor),
  resetZoomFactor: () => ipcRenderer.invoke("window-reset-zoom-factor"),
  openExternal: (url: string) => ipcRenderer.invoke("open-external-url", url),
  onUpdateAvailable: (
    callback: (payload: {
      currentVersion: string;
      latestVersion: string;
      releaseUrl: string;
    }) => void,
  ) => {
    const listener = (
      _event: unknown,
      payload: {
        currentVersion: string;
        latestVersion: string;
        releaseUrl: string;
      },
    ) => {
      callback(payload);
    };

    ipcRenderer.on("update-available", listener);

    return () => {
      ipcRenderer.removeListener("update-available", listener);
    };
  },
  onZoomChanged: (callback: (factor: number) => void) => {
    const listener = (_event: unknown, factor: number) => {
      callback(factor);
    };

    ipcRenderer.on("window-zoom-changed", listener);

    return () => {
      ipcRenderer.removeListener("window-zoom-changed", listener);
    };
  },
  onCliOutput: (
    callback: (payload: {
      command: string;
      args: string[];
      stream: "stdout" | "stderr";
      text: string;
      timestamp: number;
    }) => void,
  ) => {
    const listener = (
      _event: unknown,
      payload: {
        command: string;
        args: string[];
        stream: "stdout" | "stderr";
        text: string;
        timestamp: number;
      },
    ) => {
      callback(payload);
    };

    ipcRenderer.on("cli-output", listener);

    return () => {
      ipcRenderer.removeListener("cli-output", listener);
    };
  },
});
