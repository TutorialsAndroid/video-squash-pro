<!-- Open Graph Meta Tags -->
![og-image](https://raw.githubusercontent.com/TutorialsAndroid/video-squash-pro/refs/heads/main/assets/og-image.png)

<p align="center">
  <img src="https://raw.githubusercontent.com/TutorialsAndroid/video-squash-pro/refs/heads/main/assets/logo/logo.png" alt="VideoSquash Pro Logo" width="120" />
</p>

<h1 align="center">VideoSquash Pro (Desktop)</h1>
<p align="center"><strong>Professional‑grade bulk video compressor for Windows · Handles 30 GB+ files offline</strong></p>

<p align="center">
  <a href="https://github.com/TutorialsAndroid/video-squash-pro/releases/latest"><img src="https://img.shields.io/github/v/release/TutorialsAndroid/video-squash-pro?style=flat-square" alt="Release"></a>
  <a href="https://github.com/TutorialsAndroid/video-squash-pro/blob/main/LICENSE"><img src="https://img.shields.io/github/license/TutorialsAndroid/video-squash-pro?style=flat-square" alt="License"></a>
  <a href="https://github.com/TutorialsAndroid/video-squash-pro/issues"><img src="https://img.shields.io/github/issues/TutorialsAndroid/video-squash-pro?style=flat-square" alt="Issues"></a>
</p>

<p align="center">
  <a href="https://tutorialsandroid.github.io/video-squash-pro/index.html"><strong>🌐 Landing Page</strong></a> ·
  <a href="https://github.com/TutorialsAndroid/video-squash-pro/releases/download/v1.1.9/VideoSquash.Pro.Setup.1.1.9.exe"><strong>⬇️ Download for Windows</strong></a> ·
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#usage">Usage</a> ·
  <a href="SETUP.md"><strong>📖 Developer Setup</strong></a>
</p>

<br/>

## 🎥 Why VideoSquash Pro Desktop?

Online video compressors can’t handle real footage. Uploading a 35 GB Blu‑ray remux or a 50 GB recording session is slow, insecure, and often impossible.  
**VideoSquash Pro** runs natively on your Windows PC using a full FFmpeg binary – no uploads, no size limits, no internet required.

> ✅ Crushes 30 GB+ files effortlessly  
> ✅ Fully offline – the only network request is to download the app  
> ✅ Professional presets, codec control, and batch processing  
> ✅ Open source & MIT licensed  

<br/>

## ✨ Features

- **No file size limits** – tested with 30 GB, 50 GB, and beyond (streams from disk, not RAM)
- **Native FFmpeg engine** – H.264, H.265/HEVC, VP9, AV1 encoding with full hardware acceleration
- **Batch queue** – drop dozens of videos, compress them sequentially in the background
- **Real‑time progress** – per‑file percentage, time remaining, and current speed
- **Smart presets** – Maximum / High / Medium / Low, plus fully custom CRF, resolution, codec, container
- **Privacy‑first** – zero telemetry, analytics, or network calls after installation
- **ZIP export** – bundle all compressed videos into a single archive
- **Modern, responsive UI** – built with the same design language as ImageSquash Pro
- **Keyboard shortcuts** – `Ctrl+Enter` to compress all, `Ctrl+D` to export ZIP

<br/>

## 📸 Screenshots

> *Add your own screenshots after building the app. Suggested shots:*  
> - Main interface with several videos queued  
> - Compression progress with percentage bar  
> - Settings panel showing presets and codec options  

<br/>

## 🚀 How It Works (under the hood)

1. **Electron** hosts the UI (HTML/CSS/JS) and spawns a native FFmpeg child process.
2. **FFmpeg** reads the source file directly from disk and writes the output – the whole video is never loaded into memory.
3. **ffprobe** extracts the video duration for accurate progress calculation.
4. **Progress events** are sent via IPC from the main process to the renderer and displayed live.
5. The final files are stored locally – nothing is ever uploaded.

<br/>

## 🧰 Tech Stack

| Layer        | Technology |
|--------------|-----------|
| Runtime      | Electron 28 |
| Video engine | FFmpeg (native binary) |
| Metadata     | ffprobe |
| UI           | HTML5, CSS3, Vanilla JS |
| ZIP creation | JSZip |
| Build/packaging | electron-builder (NSIS installer) |

<br/>

## 📦 Usage

### Option 1: Download the pre‑built installer (Windows)

1. Go to the [Releases page](https://github.com/TutorialsAndroid/video-squash-pro/releases/latest).
2. Download the `VideoSquash-Pro-Setup-x.x.x.exe` file.
3. Run the installer – it’s a standard Windows setup, no command line required.
4. Launch **VideoSquash Pro** from the Start Menu or desktop shortcut.

### Option 2: Run from source (for developers)

**📖 For detailed setup instructions, see [SETUP.md](SETUP.md)**

```bash
git clone https://github.com/TutorialsAndroid/video-squash-pro.git
cd video-squash-pro
npm install
npm start
```

### ⚠️ Prerequisites for developers

This repository does **not** include the FFmpeg/ffprobe binaries because of their large size.  
You must download them yourself before running or building the app:

1. Go to [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) and download the **release essentials** static build for Windows.
2. Extract the archive and copy both `ffmpeg.exe` and `ffprobe.exe` into the `assets/` folder of this project.
3. Continue with the steps below.

**Build your own installer:**

```bash
npm run build
```

The installer will appear in the `dist/` folder.

<br/>

## ⚙️ Configuration

All compression settings are adjustable in the UI. The default **High** preset:

| Setting       | Value        |
|---------------|--------------|
| CRF (quality) | 30           |
| Max resolution| 1920 px      |
| Codec         | H.264 (libx264) |
| Container     | MP4          |
| Audio         | AAC 128kbps (optional removal) |

For extreme size reduction, switch to **Maximum** (CRF 40, 854 px, VP9/WebM).

<br/>

## 🤝 Contributing

Contributions, issues, and feature requests are warmly welcome!  
Feel free to check the [issues page](https://github.com/TutorialsAndroid/video-squash-pro/issues) or open a pull request.

<br/>

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

<br/>

<p align="center">
  Made with ❤️ by <a href="https://github.com/TutorialsAndroid">TutorialsAndroid</a>
</p>
