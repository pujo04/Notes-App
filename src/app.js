import "./styles.css";
import {
  getNotes,
  getArchivedNotes,
  addNote,
  deleteNote,
  archiveNote,
  unarchiveNote,
  editNote,
} from "./api.js";
import { showAlert } from "./alert.js";
import { spawnCozyParticles } from "./party-particles.js";
import { toggleAmbience, stopAmbience, isAmbienceRunning, getActiveAmbienceType } from "./soundboard.js";
import { sampleNotes } from "./sample-data.js";

// ============================
// Module State
// ============================
let activeNotesData = [];
let archivedNotesData = [];
let currentSearchQuery = "";
let currentTab = "all"; // all, ideas, plans, archived

// Local metadata for stickers and pins
function getNotesMeta() {
  try {
    return JSON.parse(localStorage.getItem("cozy_notes_meta") || "{}");
  } catch (e) {
    return {};
  }
}

function saveNoteMeta(id, meta) {
  const allMeta = getNotesMeta();
  allMeta[id] = { ...allMeta[id], ...meta };
  localStorage.setItem("cozy_notes_meta", JSON.stringify(allMeta));
}

function getNoteMeta(id) {
  const allMeta = getNotesMeta();
  return allMeta[id] || { sticker: "🌻", pinned: false, category: "all" };
}

function ensureSampleMeta() {
  const defaultStickers = ["🌻", "💡", "⭐", "☕", "🎨"];
  activeNotesData.forEach((note, idx) => {
    const existing = getNoteMeta(note.id);
    if (!existing.sticker || existing.sticker === "🌻") {
      saveNoteMeta(note.id, {
        sticker: defaultStickers[idx % defaultStickers.length],
        pinned: idx === 0, // Pin first note with cute washi tape!
        category: idx % 2 === 0 ? "ideas" : "plans",
      });
    }
  });
}

// Helpers
function formatDate(dateString) {
  const date = new Date(dateString);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

const PASTEL_COLORS = ["color-butter", "color-peach", "color-mint", "color-pink", "color-sky"];

function getCardColorClass(index) {
  return PASTEL_COLORS[index % PASTEL_COLORS.length];
}

function createEmptyState(title, subtitle, icon = "🧺✨") {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <h3 class="empty-state-title">${title}</h3>
      <p class="empty-state-subtitle">${subtitle}</p>
    </div>
  `;
}

// ============================
// Theme Management
// ============================
function initTheme() {
  const savedTheme = localStorage.getItem("notesapp-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("notesapp-theme", next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.querySelector(".theme-toggle");
  if (!btn) return;
  btn.innerHTML =
    theme === "dark"
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

// ============================
// Render & Display Notes
// ============================
async function renderNotes() {
  try {
    showAlert.loading();
    let [activeNotes, archivedNotes] = await Promise.all([
      getNotes(),
      getArchivedNotes(),
    ]);

    // If notes are empty from API, populate with sample notes
    if (activeNotes.length === 0 && archivedNotes.length === 0) {
      if (!localStorage.getItem("cozy_initial_seeded")) {
        localStorage.setItem("cozy_initial_seeded", "true");
        for (const sample of sampleNotes) {
          try {
            const created = await addNote(sample.title, sample.body);
            if (sample.archived && created && created.id) {
              await archiveNote(created.id);
            }
          } catch (e) {}
        }
        const [reActive, reArchived] = await Promise.all([
          getNotes(),
          getArchivedNotes(),
        ]);
        activeNotes = reActive;
        archivedNotes = reArchived;
      }
      if (activeNotes.length === 0 && archivedNotes.length === 0) {
        activeNotes = sampleNotes.filter((n) => !n.archived);
        archivedNotes = sampleNotes.filter((n) => n.archived);
      }
    }

    activeNotesData = activeNotes;
    archivedNotesData = archivedNotes;

    ensureSampleMeta();
    displayNotes();
  } catch (error) {
    console.error("Error rendering notes:", error);
    activeNotesData = sampleNotes.filter((n) => !n.archived);
    archivedNotesData = sampleNotes.filter((n) => n.archived);
    ensureSampleMeta();
    displayNotes();
  } finally {
    showAlert.close();
  }
}

function displayNotes() {
  const activeNoteList = document.querySelector(".active-notes");
  const archivedNoteList = document.querySelector(".archived-notes");
  const countAll = document.querySelector(".tab-count-all");
  const countIdeas = document.querySelector(".tab-count-ideas");
  const countPlans = document.querySelector(".tab-count-plans");
  const countArchived = document.querySelector(".tab-count-archived");

  if (!activeNoteList || !archivedNoteList) return;

  activeNoteList.innerHTML = "";
  archivedNoteList.innerHTML = "";

  const query = currentSearchQuery.toLowerCase().trim();

  let filteredActive = activeNotesData;
  let filteredArchived = archivedNotesData;

  if (query) {
    filteredActive = activeNotesData.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.body.toLowerCase().includes(query),
    );
    filteredArchived = archivedNotesData.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.body.toLowerCase().includes(query),
    );
  }

  // Filter based on tab
  if (currentTab === "ideas") {
    filteredActive = filteredActive.filter((n) => {
      const meta = getNoteMeta(n.id);
      return meta.category === "ideas" || meta.sticker === "💡" || meta.sticker === "🎨";
    });
  } else if (currentTab === "plans") {
    filteredActive = filteredActive.filter((n) => {
      const meta = getNoteMeta(n.id);
      return meta.category === "plans" || meta.sticker === "⭐" || meta.sticker === "📌";
    });
  }

  // Sort: Pinned notes always come first
  filteredActive.sort((a, b) => {
    const metaA = getNoteMeta(a.id);
    const metaB = getNoteMeta(b.id);
    if (metaA.pinned === metaB.pinned) return 0;
    return metaA.pinned ? -1 : 1;
  });

  // Render Active
  if (filteredActive.length === 0) {
    activeNoteList.innerHTML = createEmptyState(
      query ? "Tidak Ditemukan" : "Catatan Masih Kosong",
      query
        ? `Tidak ada catatan yang cocok dengan "${currentSearchQuery}"`
        : "Kotak idemu masih rapi dan tenang. Yuk tulis catatan hangat pertamamu hari ini! ✨",
      "🧺🌻",
    );
  } else {
    filteredActive.forEach((note, index) => {
      const noteItem = document.createElement("note-item");
      noteItem.noteData = note;
      noteItem.cardIndex = index;
      noteItem.style.opacity = "0";
      activeNoteList.appendChild(noteItem);

      if (window.anime) {
        window.anime({
          targets: noteItem,
          opacity: 1,
          translateY: [20, 0],
          delay: index * 50,
          duration: 400,
          easing: "easeOutCubic",
        });
      } else {
        noteItem.style.opacity = "1";
      }
    });
  }

  // Render Archived
  if (filteredArchived.length === 0) {
    archivedNoteList.innerHTML = createEmptyState(
      query ? "Tidak Ditemukan" : "Arsip Kosong",
      query
        ? `Tidak ada catatan arsip yang cocok dengan "${currentSearchQuery}"`
        : "Catatan yang sudah selesai dan diarsipkan akan tersimpan rapi di sini.",
      "📦🌿",
    );
  } else {
    filteredArchived.forEach((note, index) => {
      const noteItem = document.createElement("note-item");
      noteItem.noteData = note;
      noteItem.cardIndex = index;
      noteItem.style.opacity = "0";
      archivedNoteList.appendChild(noteItem);

      if (window.anime) {
        window.anime({
          targets: noteItem,
          opacity: 1,
          translateY: [20, 0],
          delay: index * 50,
          duration: 400,
          easing: "easeOutCubic",
        });
      } else {
        noteItem.style.opacity = "1";
      }
    });
  }

  // Update counts
  if (countAll) countAll.textContent = activeNotesData.length;
  if (countIdeas) {
    const ideasCount = activeNotesData.filter((n) => {
      const m = getNoteMeta(n.id);
      return m.category === "ideas" || m.sticker === "💡" || m.sticker === "🎨";
    }).length;
    countIdeas.textContent = ideasCount;
  }
  if (countPlans) {
    const plansCount = activeNotesData.filter((n) => {
      const m = getNoteMeta(n.id);
      return m.category === "plans" || m.sticker === "⭐" || m.sticker === "📌";
    }).length;
    countPlans.textContent = plansCount;
  }
  if (countArchived) countArchived.textContent = archivedNotesData.length;
}

// ============================
// Web Component: AppBar
// ============================
class AppBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="navbar">
        <div class="navbar-brand">
          <svg class="navbar-logo" width="34" height="34" viewBox="0 0 64 64" fill="none">
            <rect x="4" y="4" width="56" height="56" rx="18" fill="#FED7AA"/>
            <rect x="12" y="12" width="40" height="40" rx="12" fill="#FFFFFF"/>
            <text x="32" y="42" font-size="26" text-anchor="middle">🌻</text>
          </svg>
          <span class="navbar-title">CozyNotes</span>
          <span class="navbar-badge">Jurnal Harian</span>
        </div>
        <div class="search-container">
          <input type="text" class="search-input" id="searchInput" placeholder="Cari catatan hangatmu..." autocomplete="off" />
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div class="navbar-actions">
          <button class="theme-toggle" id="themeToggle" aria-label="Toggle tema gelap/terang" title="Ubah Suasana Langit">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
        </div>
      </nav>
    `;

    const searchInput = this.querySelector("#searchInput");
    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearchQuery = e.target.value;
        displayNotes();
      }, 180);
    });

    this.querySelector("#themeToggle").addEventListener("click", toggleTheme);
  }
}

// ============================
// Web Component: Daily Mood & Greeting
// ============================
class MoodGreeting extends HTMLElement {
  connectedCallback() {
    this._currentMood = localStorage.getItem("cozy_daily_mood") || "😊";
    this.render();
    this.setupListeners();
  }

  render() {
    const moods = [
      { emoji: "😊", label: "Ceria", prompt: "Senang melihat senyummu!" },
      { emoji: "☕", label: "Tenang", prompt: "Nikmati secangkir waktu santai." },
      { emoji: "🌱", label: "Semangat", prompt: "Setiap langkah kecil sangat berarti!" },
      { emoji: "🎨", label: "Kreatif", prompt: "Waktunya tuangkan ide cemerlangmu!" },
    ];

    const activeObj = moods.find((m) => m.emoji === this._currentMood) || moods[0];

    this.innerHTML = `
      <div class="mood-greeting-card">
        <div class="greeting-text-group">
          <span class="greeting-avatar">${activeObj.emoji}</span>
          <div>
            <h2 class="greeting-title">Selamat datang kembali! 🌻</h2>
            <p class="greeting-subtitle">${activeObj.prompt} Bagaimana suasana hatimu saat ini?</p>
          </div>
        </div>
        <div class="mood-selector-group">
          <span class="mood-prompt">Pilih Mood:</span>
          ${moods
            .map(
              (m) => `
            <button type="button" class="mood-btn ${m.emoji === this._currentMood ? "active" : ""}" data-emoji="${m.emoji}">
              <span>${m.emoji}</span>
              <span>${m.label}</span>
            </button>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  setupListeners() {
    this.querySelectorAll(".mood-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const emoji = btn.getAttribute("data-emoji");
        this._currentMood = emoji;
        localStorage.setItem("cozy_daily_mood", emoji);
        spawnCozyParticles(btn);
        this.render();
        this.setupListeners();
      });
    });
  }
}

// ============================
// Web Component: Form Note (Gingham Memo)
// ============================
class FormNote extends HTMLElement {
  connectedCallback() {
    this._isExpanded = false;
    this._selectedSticker = "🌻";
    this.render();
    this.setupEventListeners();
  }

  render() {
    const stickers = ["🌻", "☕", "🦋", "🎀", "⭐", "💡", "🎨", "📌"];

    this.innerHTML = `
      <div class="gingham-wrapper">
        <div class="memo-paper">
          <div class="form-collapsed" id="formCollapsed">
            <span>✏️ Tulis ide atau catatan hangatmu di sini...</span>
          </div>
          <form id="noteForm" class="form-expanded" style="display: none;">
            <div class="form-field">
              <input type="text" id="title" name="title" placeholder="Judul Catatan..." required autocomplete="off" />
              <small class="field-error" id="titleError"></small>
            </div>
            <div class="form-field">
              <textarea id="body" name="body" rows="4" placeholder="Ceritakan ide, rencanamu, atau hal indah hari ini..." required></textarea>
              <small class="field-error" id="bodyError"></small>
            </div>

            <!-- Sticker & Pin Options -->
            <div class="sticker-picker-row">
              <span class="sticker-picker-label">Tempel Stiker:</span>
              <div class="sticker-options">
                ${stickers
                  .map(
                    (s) => `
                  <button type="button" class="sticker-opt-btn ${s === this._selectedSticker ? "active" : ""}" data-sticker="${s}">${s}</button>
                `,
                  )
                  .join("")}
              </div>
            </div>

            <label class="pin-toggle-row">
              <input type="checkbox" id="pinToggle" />
              <span>Sematkan catatan ini di atas dengan selotip pita (Pin Note)</span>
            </label>

            <div class="form-actions">
              <button type="button" class="btn btn-ghost" id="cancelBtn">Batal</button>
              <button type="submit" class="btn btn-primary" id="saveNoteBtn">
                <span>Simpan Catatan ✨</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const collapsed = this.querySelector("#formCollapsed");
    const form = this.querySelector("#noteForm");
    const cancelBtn = this.querySelector("#cancelBtn");

    collapsed.addEventListener("click", () => this.expandForm());
    cancelBtn.addEventListener("click", () => this.collapseForm());

    this.querySelectorAll(".sticker-opt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.querySelectorAll(".sticker-opt-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this._selectedSticker = btn.getAttribute("data-sticker");
      });
    });

    form.addEventListener("submit", this.handleSubmit.bind(this));

    document.addEventListener("click", (e) => {
      if (this._isExpanded && !this.contains(e.target)) {
        const title = this.querySelector("#title").value.trim();
        const body = this.querySelector("#body").value.trim();
        if (!title && !body) {
          this.collapseForm();
        }
      }
    });
  }

  expandForm() {
    const collapsed = this.querySelector("#formCollapsed");
    const form = this.querySelector("#noteForm");
    collapsed.style.display = "none";
    form.style.display = "flex";
    this._isExpanded = true;
    if (window.anime) {
      window.anime({
        targets: form,
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 250,
        easing: "easeOutCubic",
      });
    }
    this.querySelector("#title").focus();
  }

  collapseForm() {
    const collapsed = this.querySelector("#formCollapsed");
    const form = this.querySelector("#noteForm");
    form.style.display = "none";
    collapsed.style.display = "flex";
    this._isExpanded = false;
    form.reset();
  }

  async handleSubmit(e) {
    e.preventDefault();
    const title = this.querySelector("#title").value.trim();
    const body = this.querySelector("#body").value.trim();
    const isPinned = this.querySelector("#pinToggle").checked;

    if (!title || !body) return;

    try {
      showAlert.loading();
      const created = await addNote(title, body);

      if (created && created.id) {
        let category = "all";
        if (this._selectedSticker === "💡" || this._selectedSticker === "🎨") category = "ideas";
        if (this._selectedSticker === "⭐" || this._selectedSticker === "📌") category = "plans";

        saveNoteMeta(created.id, {
          sticker: this._selectedSticker,
          pinned: isPinned,
          category,
        });
      }

      const btn = this.querySelector("#saveNoteBtn");
      spawnCozyParticles(btn);

      this.collapseForm();
      await renderNotes();
      showAlert.success("Catatan hangat berhasil disimpan! ✨");
    } catch (error) {
      console.error("Error adding note:", error);
      showAlert.error("Gagal menyimpan catatan. Silakan coba lagi.");
    }
  }
}

// ============================
// Web Component: Note Item
// ============================
class NoteItem extends HTMLElement {
  set noteData(note) {
    this._note = note;
    this.render();
  }

  set cardIndex(idx) {
    this._cardIndex = idx;
    this.render();
  }

  render() {
    if (!this._note) return;
    const { id, title, body, createdAt, archived } = this._note;
    const meta = getNoteMeta(id);
    const colorClass = getCardColorClass(this._cardIndex || 0);

    this.innerHTML = `
      <div class="note-card ${colorClass} ${meta.pinned ? "is-pinned" : ""}">
        <div class="note-card-top-row">
          <span class="note-card-sticker">${meta.sticker || "🌻"}</span>
          ${meta.pinned ? `<span class="pinned-badge">📌 Disematkan</span>` : ""}
        </div>
        <div class="note-card-header">
          <h3 class="note-card-title">${title}</h3>
        </div>
        <div class="note-card-body">
          <p class="note-card-text">${body}</p>
        </div>
        <div class="note-card-footer">
          <span class="note-date">
            <span>📅</span> ${formatDate(createdAt)}
          </span>
          <div class="note-actions">
            <button class="action-btn pin-btn ${meta.pinned ? "active" : ""}" title="${meta.pinned ? "Lepas Sematan" : "Sematkan Catatan"}">
              📌
            </button>
            <button class="action-btn edit-btn" title="Edit Catatan">
              ✏️
            </button>
            <button class="action-btn archive-btn" title="${archived ? "Pulihkan" : "Arsipkan"}">
              ${archived ? "📂" : "🗄️"}
            </button>
            <button class="action-btn delete-btn" title="Hapus Catatan">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;

    this.querySelector(".pin-btn").addEventListener("click", () => this.togglePin());
    this.querySelector(".edit-btn").addEventListener("click", () => this.openEdit());
    this.querySelector(".archive-btn").addEventListener("click", () => this.toggleArchive());
    this.querySelector(".delete-btn").addEventListener("click", () => this.deleteSelf());
  }

  togglePin() {
    const meta = getNoteMeta(this._note.id);
    const newPinned = !meta.pinned;
    saveNoteMeta(this._note.id, { pinned: newPinned });
    spawnCozyParticles(this.querySelector(".pin-btn"));
    displayNotes();
  }

  openEdit() {
    const modal = document.querySelector("edit-modal");
    if (modal) {
      modal.open(this._note);
    }
  }

  async toggleArchive() {
    try {
      showAlert.loading();
      if (this._note.archived) {
        await unarchiveNote(this._note.id);
      } else {
        await archiveNote(this._note.id);
      }
      await renderNotes();
      showAlert.success(`Catatan berhasil ${this._note.archived ? "dipulihkan" : "diarsipkan"}!`);
    } catch (error) {
      console.error("Error archiving note:", error);
      showAlert.error("Gagal mengubah status arsip.");
    }
  }

  async deleteSelf() {
    const confirmed = await showAlert.confirm("Apakah kamu yakin ingin menghapus catatan hangat ini?");
    if (confirmed) {
      try {
        showAlert.loading();
        await deleteNote(this._note.id);
        await renderNotes();
        showAlert.success("Catatan berhasil dihapus!");
      } catch (error) {
        console.error("Error deleting note:", error);
        showAlert.error("Gagal menghapus catatan.");
      }
    }
  }
}

// ============================
// Web Component: Notes Section (Tabs & Grid)
// ============================
class NotesSection extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupTabs();
  }

  render() {
    this.innerHTML = `
      <div class="section-container">
        <div class="tabs-container">
          <button class="tab active" data-tab="all">
            <span>🌻 Semua Catatan</span>
            <span class="tab-badge tab-count-all">0</span>
          </button>
          <button class="tab" data-tab="ideas">
            <span>💡 Ide & Inspirasi</span>
            <span class="tab-badge tab-count-ideas">0</span>
          </button>
          <button class="tab" data-tab="plans">
            <span>⭐ Rencana</span>
            <span class="tab-badge tab-count-plans">0</span>
          </button>
          <button class="tab" data-tab="archived">
            <span>🗄️ Arsip</span>
            <span class="tab-badge tab-count-archived">0</span>
          </button>
        </div>
        <div class="tab-content">
          <div class="tab-pane active" id="activePane">
            <div class="note-list-grid active-notes"></div>
          </div>
          <div class="tab-pane" id="archivedPane">
            <div class="note-list-grid archived-notes"></div>
          </div>
        </div>
      </div>
    `;
  }

  setupTabs() {
    const tabs = this.querySelectorAll(".tab");
    const activePane = this.querySelector("#activePane");
    const archivedPane = this.querySelector("#archivedPane");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        const target = tab.getAttribute("data-tab");
        currentTab = target;

        if (target === "archived") {
          activePane.classList.remove("active");
          archivedPane.classList.add("active");
        } else {
          archivedPane.classList.remove("active");
          activePane.classList.add("active");
        }

        displayNotes();
      });
    });
  }
}

// ============================
// Web Component: Daily Checklist (Sidebar)
// ============================
class PicnicChecklist extends HTMLElement {
  connectedCallback() {
    this.loadItems();
    this.render();
    this.setupListeners();
  }

  loadItems() {
    try {
      const saved = localStorage.getItem("cozy_checklist_items");
      if (saved) {
        this._items = JSON.parse(saved);
      } else {
        this._items = [
          { id: 1, text: "Minum segelas air hangat 💧", done: true },
          { id: 2, text: "Tulis 3 hal yang disyukuri hari ini ✨", done: false },
          { id: 3, text: "Jalan santai hirup udara segar 🍃", done: false },
          { id: 4, text: "Baca buku favorit 15 menit 📖", done: false },
        ];
        this.saveItems();
      }
    } catch (e) {
      this._items = [];
    }
  }

  saveItems() {
    localStorage.setItem("cozy_checklist_items", JSON.stringify(this._items));
  }

  render() {
    const doneCount = this._items.filter((i) => i.done).length;
    this.innerHTML = `
      <div class="checklist-card">
        <div class="checklist-header">
          <div class="checklist-title-group">
            <span>📋</span>
            <h3 class="checklist-title">Rencana Hari Ini</h3>
          </div>
          <span class="checklist-count">${doneCount}/${this._items.length} Selesai</span>
        </div>
        <ul class="checklist-items">
          ${this._items
            .map(
              (item) => `
            <li class="checklist-item ${item.done ? "done" : ""}" data-id="${item.id}">
              <input type="checkbox" class="checklist-checkbox" ${item.done ? "checked" : ""} />
              <span class="checklist-label">${item.text}</span>
              <button class="checklist-del-btn" title="Hapus">×</button>
            </li>
          `,
            )
            .join("")}
        </ul>
        <form class="checklist-add-form" id="checklistForm">
          <input type="text" class="checklist-add-input" placeholder="Tambah rencana baru..." required />
          <button type="submit" class="checklist-add-btn">+ Tambah</button>
        </form>
      </div>
    `;
  }

  setupListeners() {
    this.querySelectorAll(".checklist-checkbox").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const id = Number(cb.closest(".checklist-item").getAttribute("data-id"));
        const item = this._items.find((i) => i.id === id);
        if (item) {
          item.done = cb.checked;
          this.saveItems();
          if (item.done) {
            spawnCozyParticles(cb);
          }
          this.render();
          this.setupListeners();
        }
      });
    });

    this.querySelectorAll(".checklist-del-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.closest(".checklist-item").getAttribute("data-id"));
        this._items = this._items.filter((i) => i.id !== id);
        this.saveItems();
        this.render();
        this.setupListeners();
      });
    });

    const form = this.querySelector("#checklistForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector("input");
        const val = input.value.trim();
        if (val) {
          this._items.push({ id: Date.now(), text: val, done: false });
          this.saveItems();
          spawnCozyParticles(form.querySelector("button"));
          this.render();
          this.setupListeners();
        }
      });
    }
  }
}

// ============================
// Web Component: Cozy Soundboard (Sidebar)
// ============================
class CozySoundboard extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  render() {
    const running = isAmbienceRunning();
    const currentType = getActiveAmbienceType();

    this.innerHTML = `
      <div class="soundboard-card">
        <div class="soundboard-header">
          <div class="soundboard-title-group">
            <span>📻</span>
            <h3 class="soundboard-title">Suasana Tenang</h3>
          </div>
          ${
            running
              ? `
            <div class="sound-pulse" title="Sedang memutar audio santai">
              <span class="sound-bar"></span>
              <span class="sound-bar"></span>
              <span class="sound-bar"></span>
            </div>
          `
              : ""
          }
        </div>
        <div class="soundboard-options">
          <button type="button" class="sound-btn ${running && currentType === "birds" ? "active" : ""}" data-sound="birds">
            <span class="sound-btn-icon">🐦</span>
            <span>Kicau Burung</span>
          </button>
          <button type="button" class="sound-btn ${running && currentType === "breeze" ? "active" : ""}" data-sound="breeze">
            <span class="sound-btn-icon">🍃</span>
            <span>Semilir Angin</span>
          </button>
          <button type="button" class="sound-btn ${running && currentType === "chimes" ? "active" : ""}" data-sound="chimes">
            <span class="sound-btn-icon">🎶</span>
            <span>Kotak Musik</span>
          </button>
        </div>
        ${
          running
            ? `<button type="button" class="sound-stop-btn" id="stopSoundBtn">⏹️ Hentikan Suara</button>`
            : ""
        }
      </div>
    `;
  }

  setupListeners() {
    this.querySelectorAll(".sound-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.getAttribute("data-sound");
        toggleAmbience(type);
        this.render();
        this.setupListeners();
      });
    });

    const stopBtn = this.querySelector("#stopSoundBtn");
    if (stopBtn) {
      stopBtn.addEventListener("click", () => {
        stopAmbience();
        this.render();
        this.setupListeners();
      });
    }
  }
}

// ============================
// Web Component: Edit Modal
// ============================
class EditModal extends HTMLElement {
  connectedCallback() {
    this._currentNote = null;
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
      <div class="modal-backdrop" id="editBackdrop">
        <div class="modal-dialog" id="editDialog" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div class="modal-header">
            <div class="modal-title-group">
              <span>✏️</span>
              <h3 class="modal-title" id="modalTitle">Edit Catatan Hangat</h3>
            </div>
            <button type="button" class="modal-close-btn" id="closeModalBtn" aria-label="Tutup modal">✕</button>
          </div>
          <form id="editForm" class="modal-form">
            <div class="form-field">
              <label for="editTitle" class="form-label">Judul Catatan</label>
              <input type="text" id="editTitle" name="title" placeholder="Judul catatan..." required autocomplete="off" />
            </div>
            <div class="form-field">
              <label for="editBody" class="form-label">Isi Catatan</label>
              <textarea id="editBody" name="body" rows="6" placeholder="Isi catatan..." required></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" id="cancelEditBtn">Batal</button>
              <button type="submit" class="btn btn-primary" id="saveEditBtn">
                Simpan Perubahan ✨
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const backdrop = this.querySelector("#editBackdrop");
    const closeBtn = this.querySelector("#closeModalBtn");
    const cancelBtn = this.querySelector("#cancelEditBtn");
    const form = this.querySelector("#editForm");

    closeBtn.addEventListener("click", () => this.close());
    cancelBtn.addEventListener("click", () => this.close());

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) this.close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && backdrop.classList.contains("open")) {
        this.close();
      }
    });

    form.addEventListener("submit", this.handleSubmit.bind(this));
  }

  open(note) {
    this._currentNote = note;
    const backdrop = this.querySelector("#editBackdrop");
    const titleInput = this.querySelector("#editTitle");
    const bodyInput = this.querySelector("#editBody");

    titleInput.value = note.title;
    bodyInput.value = note.body;

    backdrop.classList.add("open");
    setTimeout(() => titleInput.focus(), 50);
  }

  close() {
    const backdrop = this.querySelector("#editBackdrop");
    backdrop.classList.remove("open");
    this._currentNote = null;
  }

  async handleSubmit(event) {
    event.preventDefault();
    if (!this._currentNote) return;

    const title = this.querySelector("#editTitle").value.trim();
    const body = this.querySelector("#editBody").value.trim();

    if (!title || !body) return;

    try {
      this.close();
      showAlert.loading();

      await editNote(
        this._currentNote.id,
        title,
        body,
        this._currentNote.archived,
      );

      await renderNotes();
      showAlert.success("Catatan berhasil diperbarui! ✨");
    } catch (error) {
      console.error("Error updating note:", error);
      showAlert.error("Gagal memperbarui catatan.");
    }
  }
}

// ============================
// Register Custom Elements
// ============================
customElements.define("app-bar", AppBar);
customElements.define("mood-greeting", MoodGreeting);
customElements.define("form-note", FormNote);
customElements.define("notes-section", NotesSection);
customElements.define("note-item", NoteItem);
customElements.define("picnic-checklist", PicnicChecklist);
customElements.define("cozy-soundboard", CozySoundboard);
customElements.define("edit-modal", EditModal);

// ============================
// App Initialization
// ============================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderNotes();
});
