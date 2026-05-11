(() => {
  // ── DOM refs ─────────────────
  const selectFilesBtn = document.getElementById("selectFilesBtn");
  const resultsSection = document.getElementById("resultsSection");
  const videoGrid = document.getElementById("videoGrid");
  const resultsCount = document.getElementById("resultsCount");
  const summaryBar = document.getElementById("summaryBar");
  const sumCount = document.getElementById("sumCount");
  const sumOriginal = document.getElementById("sumOriginal");
  const sumCompressed = document.getElementById("sumCompressed");
  const sumSavings = document.getElementById("sumSavings");
  const compressAllBtn = document.getElementById("compressAllBtn");
  const downloadAllBtn = document.getElementById("downloadAllBtn");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const crfSlider = document.getElementById("crfSlider");
  const crfValue = document.getElementById("crfValue");
  const resolutionSelect = document.getElementById("resolutionSelect");
  const codecSelect = document.getElementById("codecSelect");
  const containerSelect = document.getElementById("containerSelect");
  const removeAudioCheck = document.getElementById("removeAudio");
  const presetPills = document.getElementById("presetPills");
  const toastContainer = document.getElementById("toastContainer");
  const crfGroup = document.getElementById("crfGroup");
  const resolutionGroup = document.getElementById("resolutionGroup");

  // ── State ──────────────────────
  let videoItems = [];
  let itemIdCounter = 0;
  let currentPreset = "high";

  // ── Presets ────────────────────
  const presets = {
    maximum: { crf: 40, resolution: 854, label: "Maximum" },
    high: { crf: 30, resolution: 1920, label: "High" },
    medium: { crf: 25, resolution: 1920, label: "Medium" },
    low: { crf: 22, resolution: 2560, label: "Low" },
  };

  function applyPreset(name) {
    currentPreset = name;
    if (name === "custom") {
      updatePillActive("custom");
      crfGroup.style.opacity = "1";
      resolutionGroup.style.opacity = "1";
      return;
    }
    const p = presets[name];
    if (p) {
      crfSlider.value = p.crf;
      crfValue.textContent = p.crf;
      resolutionSelect.value = p.resolution;
      updatePillActive(name);
      crfGroup.style.opacity = "0.55";
      resolutionGroup.style.opacity = "0.55";
    }
  }

  function updatePillActive(name) {
    presetPills.querySelectorAll(".preset-pill").forEach((pill) => {
      pill.classList.toggle("active", pill.dataset.preset === name);
    });
  }

  function getCurrentSettings() {
    return {
      crf: parseInt(crfSlider.value),
      resolution: parseInt(resolutionSelect.value),
      codec: codecSelect.value,
      container: containerSelect.value,
      removeAudio: removeAudioCheck.checked,
    };
  }

  // ── Utilities ──────────────────
  function formatSize(bytes) {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }

  function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 3000);
  }

  function extractFilename(filePath) {
    return filePath.replace(/^.*[\\\/]/, "");
  }

  // ── File selection ─────────────
  selectFilesBtn.addEventListener("click", async () => {
    const filePaths = await window.electronAPI.selectVideos();
    if (filePaths.length === 0) return;
    handleSelectedFiles(filePaths);
  });

  async function handleSelectedFiles(filePaths) {
    const newItems = [];
    for (const filePath of filePaths) {
      const size = await window.electronAPI.getFileSize(filePath);
      const item = {
        id: ++itemIdCounter,
        filePath,
        fileName: extractFilename(filePath),
        originalSize: size,
        compressedPath: null,
        compressedSize: null,
        status: "pending",
        progress: 0,
        duration: null, // will be fetched later
        elements: null, // DOM references for progress updates
      };
      newItems.push(item);
    }
    videoItems.push(...newItems);
    renderAll();
    showToast(`✅ ${newItems.length} video(s) added.`);
  }

  // ── Compression (with real progress) ─
  async function compressItem(item, settings) {
    item.status = "compressing";
    item.progress = 0;
    renderAll(); // initial render to show card in compressing state

    // 1) Get duration
    try {
      const dur = await window.electronAPI.getVideoDuration(item.filePath);
      item.duration = dur && dur > 0 ? dur : null;
    } catch (err) {
      console.warn("ffprobe failed, using indeterminate progress", err);
      item.duration = null;
    }

    // 2) Ask for output directory
    const outputDir = await window.electronAPI.selectOutputDir();
    if (!outputDir) {
      item.status = "pending";
      renderAll();
      return;
    }

    const ext =
      settings.container === "webm"
        ? "webm"
        : settings.container === "mkv"
          ? "mkv"
          : "mp4";
    const baseName = item.fileName.replace(/\.[^.]+$/, "");
    const outputPath = `${outputDir}\\${baseName}_compressed.${ext}`;

    // 3) Listen for progress and update card elements directly
    const progressHandler = (data) => {
      const timeMicro = data.timeMs || 0;
      const durationSec = item.duration; // may be null

      if (durationSec == null) {
        // Indeterminate: just show a pulsing bar, no percentage
        if (item.elements && item.elements.progressText) {
          item.elements.progressText.textContent = "...";
        }
        // Optional: set progress bar to something like 99% width with slower animation
        if (item.elements && item.elements.progressBar) {
          item.elements.progressBar.style.width = "80%"; // fake steady
        }
        return;
      }

      const elapsedSec = timeMicro / 1_000_000;
      const percent = Math.min(
        100,
        Math.round((elapsedSec / durationSec) * 100),
      );
      item.progress = percent;

      if (item.elements) {
        if (item.elements.progressBar) {
          item.elements.progressBar.style.width = percent + "%";
        }
        if (item.elements.progressText) {
          item.elements.progressText.textContent = percent + "%";
        }
      }
    };

    window.electronAPI.onProgress(progressHandler);

    try {
      await window.electronAPI.compressVideo({
        inputPath: item.filePath,
        outputPath,
        ...settings,
      });
      item.compressedPath = outputPath;
      item.compressedSize = await window.electronAPI.getFileSize(outputPath);
      item.status = "done";
      item.progress = 100;
    } catch (err) {
      console.error(err);
      item.status = "error";
      item.errorMsg = err.message;
    } finally {
      window.electronAPI.removeProgressListener();
    }

    // Final re-render to show done/error state
    renderAll();
  }

  async function compressAll() {
    const pending = videoItems.filter(
      (i) => i.status === "pending" || i.status === "error",
    );
    if (pending.length === 0) {
      showToast("⚠️ No videos to compress.");
      return;
    }
    const settings = getCurrentSettings();
    compressAllBtn.disabled = true;
    for (const item of pending) {
      await compressItem(item, settings);
    }
    compressAllBtn.disabled = false;
    updateSummary();
    showToast("✅ Compression complete.");
  }

  // ── ZIP export (simplified) ─────
  async function downloadAllZip() {
    const done = videoItems.filter(
      (i) => i.status === "done" && i.compressedPath,
    );
    if (done.length === 0) {
      showToast("⚠️ No compressed videos to export.");
      return;
    }
    const outputDir = await window.electronAPI.selectOutputDir();
    if (!outputDir) return;

    const zip = new JSZip();
    for (const item of done) {
      // Read file via fetch (file://) – works in Electron
      const response = await fetch(
        "file:///" + item.compressedPath.replace(/\\/g, "/"),
      );
      const blob = await response.blob();
      zip.file(
        item.fileName.replace(/\.[^.]+$/, "") +
          "_compressed." +
          item.compressedPath.split(".").pop(),
        blob,
      );
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipPath = `${outputDir}\\videosquash_export.zip`;
    // Write to disk via IPC (we'll add a simple handler later, but for now you can use electronAPI.saveBlob if you implement it)
    // Alternatively, use fetch + fs via preload...
    alert(
      "ZIP export not fully implemented in this demo. Save the blob manually.",
    );
  }

  // ── Render helpers ──────────────
  function renderAll() {
    renderVideoGrid();
    updateSummary();
    updateVisibility();
  }

  function renderVideoGrid() {
    videoGrid.innerHTML = "";
    if (videoItems.length === 0) {
      resultsSection.style.display = "none";
      return;
    }
    resultsSection.style.display = "block";
    resultsCount.textContent = `(${videoItems.length} file${videoItems.length !== 1 ? "s" : ""})`;
    videoItems.forEach((item) => {
      const card = createVideoCard(item);
      videoGrid.appendChild(card);
    });
  }

  function createVideoCard(item) {
    const card = document.createElement("div");
    card.className = "video-card";

    // Preview
    const preview = document.createElement("div");
    preview.className = "card-preview";
    const playIcon = document.createElement("span");
    playIcon.className = "play-icon";
    playIcon.textContent = "▶";
    preview.appendChild(playIcon);

    // Status overlay
    let overlay = null;
    if (item.status === "compressing") {
      overlay = document.createElement("div");
      overlay.className = "status-overlay";
      overlay.innerHTML = '<div class="spinner"></div> Compressing...';
      preview.appendChild(overlay);
    } else if (item.status === "error") {
      overlay = document.createElement("div");
      overlay.className = "status-overlay";
      overlay.style.background = "rgba(239,68,68,0.7)";
      overlay.textContent = "⚠️ Error";
      preview.appendChild(overlay);
    }

    // Progress bar (only visible during compression)
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    if (item.status === "compressing") {
      progressBar.style.width = item.progress + "%";
    }
    preview.appendChild(progressBar);

    // Percentage text (during compression)
    const progressText = document.createElement("div");
    progressText.style.cssText =
      "position:absolute;top:8px;right:8px;color:white;font-size:12px;font-weight:bold;background:rgba(0,0,0,0.6);padding:2px 8px;border-radius:10px;";
    if (item.status === "compressing") {
      progressText.textContent = item.progress + "%";
    } else {
      progressText.style.display = "none";
    }
    preview.appendChild(progressText);

    card.appendChild(preview);

    // Body
    const body = document.createElement("div");
    body.className = "card-body";
    const nameDiv = document.createElement("div");
    nameDiv.className = "card-filename";
    nameDiv.title = item.fileName;
    nameDiv.textContent = item.fileName;
    body.appendChild(nameDiv);

    const stats = document.createElement("div");
    stats.className = "card-stats";
    const origBadge = document.createElement("span");
    origBadge.className = "stat-badge stat-original";
    origBadge.textContent = "Orig: " + formatSize(item.originalSize);
    stats.appendChild(origBadge);

    if (item.status === "done" && item.compressedSize) {
      const compBadge = document.createElement("span");
      compBadge.className = "stat-badge stat-compressed";
      compBadge.textContent = "Now: " + formatSize(item.compressedSize);
      stats.appendChild(compBadge);
      const saving = Math.round(
        (1 - item.compressedSize / item.originalSize) * 100,
      );
      const saveBadge = document.createElement("span");
      saveBadge.className = "stat-badge stat-saving";
      if (saving >= 70) saveBadge.classList.add("great");
      saveBadge.textContent =
        (saving >= 0 ? "↓" : "↑") + " " + Math.abs(saving) + "%";
      stats.appendChild(saveBadge);
    } else if (item.status === "error") {
      const errBadge = document.createElement("span");
      errBadge.className = "stat-badge";
      errBadge.style.cssText = "background:#fee2e2;color:#ef4444;";
      errBadge.textContent = "Failed";
      stats.appendChild(errBadge);
    } else if (item.status === "pending") {
      const pendBadge = document.createElement("span");
      pendBadge.className = "stat-badge";
      pendBadge.style.cssText = "background:#fef3c7;color:#b45309;";
      pendBadge.textContent = "Pending";
      stats.appendChild(pendBadge);
    }
    body.appendChild(stats);

    const actions = document.createElement("div");
    actions.className = "card-actions";
    if (item.status === "done") {
      const openFolderBtn = document.createElement("button");
      openFolderBtn.className = "btn btn-success btn-xs";
      openFolderBtn.textContent = "⬇ Open Folder";
      openFolderBtn.onclick = () => {
        const { shell } = require("electron");
        shell.showItemInFolder(item.compressedPath);
      };
      actions.appendChild(openFolderBtn);
    }
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-danger btn-xs";
    removeBtn.textContent = "✕";
    removeBtn.onclick = () => removeItem(item.id);
    actions.appendChild(removeBtn);
    body.appendChild(actions);
    card.appendChild(body);

    // Store references in item for direct updates
    item.elements = {
      progressBar,
      progressText,
      overlay,
    };

    return card;
  }

  function removeItem(id) {
    videoItems = videoItems.filter((i) => i.id !== id);
    renderAll();
  }

  function updateSummary() {
    if (videoItems.length === 0) {
      summaryBar.style.display = "none";
      return;
    }
    summaryBar.style.display = "flex";
    const origTotal = videoItems.reduce((s, i) => s + i.originalSize, 0);
    const compTotal = videoItems.reduce(
      (s, i) => s + (i.compressedSize || i.originalSize),
      0,
    );
    sumCount.textContent = videoItems.length;
    sumOriginal.textContent = formatSize(origTotal);
    sumCompressed.textContent = formatSize(compTotal);
    const saving = origTotal
      ? Math.round((1 - compTotal / origTotal) * 100)
      : 0;
    sumSavings.textContent =
      (saving >= 0 ? "↓" : "↑") + " " + Math.abs(saving) + "%";
  }

  function updateVisibility() {
    /* no special logic needed */
  }

  // ── Event Listeners ─────────────
  presetPills.addEventListener("click", (e) => {
    const pill = e.target.closest(".preset-pill");
    if (pill) applyPreset(pill.dataset.preset);
  });
  crfSlider.addEventListener("input", () => {
    crfValue.textContent = crfSlider.value;
    if (currentPreset !== "custom") applyPreset("custom");
  });
  resolutionSelect.addEventListener("change", () => {
    if (currentPreset !== "custom") applyPreset("custom");
  });
  codecSelect.addEventListener("change", () => {
    if (currentPreset !== "custom") applyPreset("custom");
  });
  containerSelect.addEventListener("change", () => {
    if (currentPreset !== "custom") applyPreset("custom");
  });
  compressAllBtn.addEventListener("click", compressAll);
  downloadAllBtn.addEventListener("click", downloadAllZip);
  clearAllBtn.addEventListener("click", () => {
    videoItems = [];
    renderAll();
  });

  // Initialization
  applyPreset("high");
  renderAll();
})();
