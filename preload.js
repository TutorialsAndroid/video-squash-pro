const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  compressVideo: (options) => ipcRenderer.invoke("compress-video", options),
  getFileSize: (path) => ipcRenderer.invoke("get-file-size", path),
  getVideoDuration: (path) => ipcRenderer.invoke("get-video-duration", path),
  selectVideos: () => ipcRenderer.invoke("select-videos"),
  selectOutputDir: () => ipcRenderer.invoke("select-output-dir"),
  onProgress: (callback) =>
    ipcRenderer.on("ffmpeg-progress", (event, data) => callback(data)),
  removeProgressListener: () =>
    ipcRenderer.removeAllListeners("ffmpeg-progress"),
});
