// preload/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("api", {
  ping: () => "pong",
  scan: () => import_electron.ipcRenderer.invoke("scan-saves"),
  decode: (slotDirectory) =>
    import_electron.ipcRenderer.invoke("decode-save", slotDirectory),
  isUltrakillRunning: () =>
    import_electron.ipcRenderer.invoke("is-ultrakill-running"),
  readPreferences: (slotDirectory) =>
    import_electron.ipcRenderer.invoke("read-preferences", slotDirectory),
  writePreferences: (slotDirectory, data) =>
    import_electron.ipcRenderer.invoke("write-preferences", slotDirectory, data),
  minimize: () => import_electron.ipcRenderer.send("window-minimize"),
  maximize: () => import_electron.ipcRenderer.send("window-maximize"),
  close: () => import_electron.ipcRenderer.send("window-close"),
  getZoomFactor: () =>
    import_electron.ipcRenderer.invoke("window-get-zoom-factor"),
  setZoomFactor: (factor) =>
    import_electron.ipcRenderer.invoke("window-set-zoom-factor", factor),
  resetZoomFactor: () =>
    import_electron.ipcRenderer.invoke("window-reset-zoom-factor"),
  onZoomChanged: (callback) => {
    const listener = (_event, factor) => {
      callback(factor);
    };
    import_electron.ipcRenderer.on("window-zoom-changed", listener);
    return () => {
      import_electron.ipcRenderer.removeListener(
        "window-zoom-changed",
        listener,
      );
    };
  },
});
