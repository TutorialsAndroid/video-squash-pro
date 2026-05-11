// main.js (updated)
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

// ── ffmpeg / ffprobe paths ─────────────────
function getFFmpegPath() {
  const isDev = !app.isPackaged;
  if (isDev) return path.join(__dirname, "assets", "ffmpeg.exe");
  return path.join(process.resourcesPath, "ffmpeg.exe");
}

function getFFprobePath() {
  const isDev = !app.isPackaged;
  if (isDev) return path.join(__dirname, "assets", "ffprobe.exe");
  return path.join(process.resourcesPath, "ffprobe.exe");
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "VideoSquash Pro",
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
  });
  mainWindow.loadFile("renderer/index.html");
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ── IPC: get video duration ─────────────────
ipcMain.handle("get-video-duration", async (event, inputPath) => {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn(getFFprobePath(), [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      inputPath,
    ]);
    let output = "";
    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });
    ffprobe.stderr.on("data", (data) => {
      output += data.toString();
    });
    ffprobe.on("close", (code) => {
      if (code === 0) {
        const duration = parseFloat(output.trim());
        if (!isNaN(duration)) resolve(duration);
        else reject(new Error("Could not parse duration"));
      } else {
        reject(new Error("ffprobe failed"));
      }
    });
  });
});

// ── IPC: compress video (with structured progress) ──
ipcMain.handle(
  "compress-video",
  async (
    event,
    { inputPath, outputPath, crf, resolution, codec, container, removeAudio },
  ) => {
    return new Promise((resolve, reject) => {
      const ffmpegPath = getFFmpegPath();
      const args = ["-y", "-i", inputPath];

      // Video codec
      if (codec === "libx265") args.push("-c:v", "libx265", "-tag:v", "hvc1");
      else if (codec === "libvpx-vp9") args.push("-c:v", "libvpx-vp9");
      else if (codec === "libaom-av1")
        args.push("-c:v", "libaom-av1", "-strict", "experimental");
      else args.push("-c:v", "libx264");

      // CRF / quality
      if (codec === "libx264" || codec === "libx265" || codec === "libaom-av1")
        args.push("-crf", String(crf));
      else if (codec === "libvpx-vp9") {
        const vp9Cq = Math.round(crf * 1.2);
        args.push("-crf", String(vp9Cq), "-b:v", "0");
      }

      // Resolution filter
      args.push(
        "-vf",
        `scale='min(${resolution},iw)':min'(${resolution},ih)':force_original_aspect_ratio=decrease`,
      );

      // Audio
      if (removeAudio) args.push("-an");
      else args.push("-c:a", "aac", "-b:a", "128k");

      // Progress structured output + fast start
      args.push("-progress", "pipe:1", "-nostats");
      args.push("-movflags", "+faststart");
      args.push(outputPath);

      const proc = spawn(ffmpegPath, args);

      proc.stdout.on("data", (data) => {
        const text = data.toString();
        // Parse out_time_ms=...
        const match = text.match(/out_time_ms=(\d+)/);
        if (match && mainWindow) {
          const ms = parseInt(match[1], 10);
          mainWindow.webContents.send("ffmpeg-progress", { timeMs: ms });
        }
      });

      let stderr = "";
      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        if (code === 0) resolve({ success: true });
        else reject(new Error(`FFmpeg exited with code ${code}\n${stderr}`));
      });
      proc.on("error", (err) =>
        reject(new Error(`Failed to start FFmpeg: ${err.message}`)),
      );
    });
  },
);

// ── Other IPC (unchanged) ─────────────────────
ipcMain.handle("get-file-size", async (event, filePath) => {
  try {
    return (await fs.promises.stat(filePath)).size;
  } catch {
    return 0;
  }
});

ipcMain.handle("select-videos", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select video files",
    filters: [
      {
        name: "Videos",
        extensions: ["mp4", "mov", "mkv", "avi", "webm", "flv", "wmv", "m4v"],
      },
    ],
    properties: ["openFile", "multiSelections"],
  });
  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle("select-output-dir", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select output folder for compressed videos",
    properties: ["openDirectory"],
  });
  return result.canceled ? null : result.filePaths[0];
});
