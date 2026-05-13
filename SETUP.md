# VideoSquash Pro - Development Setup Guide

This guide walks you through setting up a local development environment for VideoSquash Pro (Desktop Edition).

## Table of Contents

- [System Requirements](#system-requirements)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup Steps](#detailed-setup-steps)
  - [Windows Setup](#windows-setup)
  - [FFmpeg Installation](#ffmpeg-installation)
  - [Project Installation](#project-installation)
- [Running the App](#running-the-app)
- [Building the Installer](#building-the-installer)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Development Tips](#development-tips)

---

## System Requirements

### Minimum
- **OS**: Windows 10 or later (64-bit)
- **RAM**: 4 GB
- **Disk Space**: 2 GB for development environment
- **GPU**: Optional, but recommended for faster video encoding

### Recommended
- **OS**: Windows 11 (64-bit)
- **RAM**: 8 GB or more
- **Disk Space**: 5+ GB
- **GPU**: NVIDIA or AMD with hardware video encoding support

---

## Prerequisites

Before starting development on VideoSquash Pro, ensure you have the following installed:

### 1. Node.js & npm
- **Download**: https://nodejs.org/ (LTS version recommended)
- **Verify Installation**:
  ```bash
  node --version
  npm --version
  ```
- VideoSquash Pro requires **Node.js 16+** and **npm 7+**

### 2. Git
- **Download**: https://git-scm.com/
- **Verify Installation**:
  ```bash
  git --version
  ```

### 3. FFmpeg & ffprobe Binaries ⚠️ **Required**
- **Download**: https://www.gyan.dev/ffmpeg/builds/
- **Which Version**: Click "Release" → "Essentials" build (static)
- **Extract**: Unzip the archive to a temporary location
- **Copy Binaries**: Extract `ffmpeg.exe` and `ffprobe.exe` and place them in the `assets/` folder of this project
- **Verify**: Check that `assets/ffmpeg.exe` and `assets/ffprobe.exe` exist

> **Why required?** The app uses native FFmpeg to handle video compression. The binaries are not included in the repo due to their large size (~200 MB).

---

## Quick Start

If you have all prerequisites installed, clone and run:

```bash
git clone https://github.com/TutorialsAndroid/video-squash-pro.git
cd video-squash-pro
npm install
npm start
```

> **Note**: Make sure `ffmpeg.exe` and `ffprobe.exe` are in the `assets/` folder before running `npm start`.

---

## Detailed Setup Steps

### Windows Setup

#### Step 1: Install Node.js
1. Visit https://nodejs.org/ and download the LTS version
2. Run the installer
3. Accept the default options (the installer will add Node.js to your PATH)
4. Open a new Command Prompt or PowerShell and verify:
   ```bash
   node --version
   npm --version
   ```

#### Step 2: Install Git
1. Visit https://git-scm.com/
2. Download the Windows installer
3. Run the installer and accept the default options
4. Open a new Command Prompt and verify:
   ```bash
   git --version
   ```

### FFmpeg Installation

#### Step 1: Download FFmpeg
1. Open https://www.gyan.dev/ffmpeg/builds/ in your browser
2. Click the **"release"** link under the "Essentials" section
3. A `.7z` file will download (approximately 50 MB)

#### Step 2: Extract FFmpeg
1. Install **7-Zip** from https://www.7-zip.org/ (if not already installed)
2. Right-click the downloaded `.7z` file and select **"7-Zip" → "Extract Here"**
3. Navigate into the extracted folder and find the `bin/` subfolder

#### Step 3: Copy Binaries to Project
1. Navigate to your cloned `video-squash-pro` directory
2. Locate the `assets/` folder (create it if it doesn't exist)
3. Copy `ffmpeg.exe` and `ffprobe.exe` from the `bin/` folder into `assets/`

**Example:**
```
video-squash-pro/
├── assets/
│   ├── ffmpeg.exe
│   ├── ffprobe.exe
│   └── [other files]
├── main.js
├── package.json
└── ...
```

#### Step 4: Verify FFmpeg Works
Open Command Prompt in the `video-squash-pro` directory and run:
```bash
.\assets\ffmpeg.exe -version
.\assets\ffprobe.exe -version
```

Both should print version information without errors.

### Project Installation

#### Step 1: Clone the Repository
```bash
git clone https://github.com/TutorialsAndroid/video-squash-pro.git
cd video-squash-pro
```

#### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- **Electron** – the desktop app framework
- **electron-builder** – for packaging the installer
- **jszip** – for creating ZIP archives of compressed videos

#### Step 3: Verify Installation
List the installed packages:
```bash
npm list
```

You should see something like:
```
video-squash-pro@1.1.9
├── electron@28.x.x
├── electron-builder@24.x.x
└── jszip@3.10.1
```

---

## Running the App

### Start in Development Mode
```bash
npm start
```

This will:
1. Launch the Electron app
2. Open the VideoSquash Pro window
3. Load the UI from `index.html` and `preload.js`

### Tips
- **Reload the app**: Press `F5` or `Ctrl+Shift+R`
- **Open developer tools**: Press `Ctrl+Shift+I` (useful for debugging)
- **Close the app**: Click the close button or press `Alt+F4`

---

## Building the Installer

To create a Windows installer (NSIS format):

```bash
npm run build
```

This will:
1. Bundle the app with Electron
2. Include FFmpeg and ffprobe binaries
3. Create an NSIS installer in the `dist/` folder

**Output:**
```
dist/
├── VideoSquash Pro Setup 1.1.9.exe  (installer)
└── [other build artifacts]
```

The installer can then be distributed to users.

---

## Project Structure

```
video-squash-pro/
├── assets/                 # Static assets
│   ├── ffmpeg.exe         # FFmpeg binary (add manually)
│   ├── ffprobe.exe        # ffprobe binary (add manually)
│   ├── icon.ico           # App icon
│   └── [other assets]
├── renderer/              # Frontend code
│   ├── index.html         # Main UI
│   ├── styles.css         # Styling
│   └── script.js          # UI logic
├── dist/                  # Build output (generated)
├── main.js                # Electron main process
├── preload.js             # IPC bridge / security context
├── package.json           # Project metadata & scripts
├── package-lock.json      # Dependency lock file
├── README.md              # Project documentation
├── SETUP.md               # This file
└── LICENSE                # MIT License
```

### Key Files
- **main.js** – Electron main process; spawns FFmpeg, manages windows
- **preload.js** – Secure IPC bridge between renderer and main process
- **renderer/** – HTML/CSS/JS for the user interface
- **assets/** – Static files, including FFmpeg binaries

---

## Troubleshooting

### Issue: "ffmpeg.exe not found"
**Cause**: The `assets/ffmpeg.exe` file is missing or in the wrong location.

**Solution**:
1. Download FFmpeg from https://www.gyan.dev/ffmpeg/builds/
2. Extract the archive and locate `ffmpeg.exe` and `ffprobe.exe`
3. Copy both files to the `assets/` folder in this project
4. Restart the app

### Issue: "npm start" fails with module errors
**Cause**: Dependencies not installed correctly.

**Solution**:
```bash
rm -r node_modules package-lock.json
npm install
npm start
```

### Issue: Installer build fails
**Cause**: FFmpeg binaries not in `assets/` folder during build.

**Solution**:
Ensure `assets/ffmpeg.exe` and `assets/ffprobe.exe` exist, then run:
```bash
npm run build
```

### Issue: App crashes when compressing video
**Cause**: FFmpeg permissions or corrupted binary.

**Solution**:
1. Check that `ffmpeg.exe` has execute permissions
2. Verify the binary by running `.\assets\ffmpeg.exe -version` in Command Prompt
3. Re-download FFmpeg from https://www.gyan.dev/ffmpeg/builds/ and replace the files

### Issue: "electron: command not found"
**Cause**: Electron not installed or npm PATH issue.

**Solution**:
```bash
npm install -g electron
npm install  # Re-install locally
npm start
```

---

## Development Tips

### 1. **Live Reload During Development**
The app doesn't auto-reload on file changes. To reload:
- Press `F5` or `Ctrl+Shift+R` in the app window

### 2. **Debugging**
Press `Ctrl+Shift+I` to open Chrome DevTools:
- Inspect elements in the **Elements** tab
- View logs in the **Console** tab
- Debug JavaScript in the **Sources** tab

### 3. **Testing the Build**
Before distributing, test the installer:
```bash
npm run build
# Open dist/VideoSquash*Setup*.exe and test the installation
```

### 4. **Adding Dependencies**
To add a new npm package:
```bash
npm install package-name
```
Then restart the app with `npm start`.

### 5. **Code Structure**
- **UI changes**: Edit files in `renderer/`
- **Process logic**: Edit `main.js`
- **IPC communication**: Edit `preload.js`

---

## Next Steps

1. ✅ Complete the setup steps above
2. ✅ Run `npm start` and verify the app launches
3. ✅ Test basic compression with a small video file
4. ✅ Explore the codebase and make your changes
5. ✅ Build and test the installer with `npm run build`

---

## Need Help?

- **GitHub Issues**: https://github.com/TutorialsAndroid/video-squash-pro/issues
- **FFmpeg Docs**: https://ffmpeg.org/documentation.html
- **Electron Docs**: https://www.electronjs.org/docs

---

**Last Updated**: 2026-05-13  
**Version**: 1.1.9  
**License**: MIT
