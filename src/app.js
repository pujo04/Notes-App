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
import { sampleNotes } from "./sample-data.js";

// ============================
// Module State
// ============================
let activeNotesData = [];
let archivedNotesData = [];
let currentSearchQuery = "";
let currentTab = "active";

// ============================
// Helpers
// ============================
function formatDate(dateString) {
  const date = new Date(dateString);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function createEmptyState(title, subtitle) {
  return `
    <div class="empty-state">
      <svg class="empty-state-icon" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="12" width="70" height="96" rx="10" stroke="currentColor" stroke-width="1.5" opacity="0.18"/>
        <rect x="30" y="17" width="60" height="86" rx="7" stroke="currentColor" stroke-width="1.8" opacity="0.35"/>
        <line x1="42" y1="38" x2="78" y2="38" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
        <line x1="42" y1="50" x2="72" y2="50" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.22"/>
        <line x1="42" y1="62" x2="65" y2="62" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.14"/>
        <circle cx="60" cy="84" r="11" stroke="currentColor" stroke-width="1.5" opacity="0.18"/>
        <line x1="55" y1="84" x2="65" y2="84" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.25"/>
        <line x1="60" y1="79" x2="60" y2="89" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.25"/>
      </svg>
      <h3 class="empty-state-title">${title}</h3>
      <p class="empty-state-subtitle">${subtitle}</p>
    </div>
  `;
}

async function seedSampleData() {
  try {
    showAlert.loading();
    for (const note of sampleNotes) {
      const created = await addNote(note.title, note.body);
      if (note.archived && created && created.id) {
        await archiveNote(created.id);
      }
    }
    await renderNotes();
    showAlert.success("Catatan contoh berhasil dimuat!");
  } catch (error) {
    console.error("Error seeding sample data:", error);
    showAlert.error("Gagal memuat catatan contoh. Silakan coba lagi.");
  }
}

// ============================
// Render & Display
// ============================
async function renderNotes() {
  try {
    showAlert.loading();
    const [activeNotes, archivedNotes] = await Promise.all([
      getNotes(),
      getArchivedNotes(),
    ]);

    activeNotesData = activeNotes;
    archivedNotesData = archivedNotes;

    displayNotes();
  } catch (error) {
    console.error("Error rendering notes:", error);
    if (activeNotesData.length === 0 && archivedNotesData.length === 0) {
      activeNotesData = sampleNotes.filter((n) => !n.archived);
      archivedNotesData = sampleNotes.filter((n) => n.archived);
      displayNotes();
    }
    showAlert.error("Gagal memuat catatan dari server. Menampilkan data lokal.");
  } finally {
    showAlert.close();
  }
}

function displayNotes() {
  const activeNoteList = document.querySelector(".active-notes");
  const archivedNoteList = document.querySelector(".archived-notes");
  const activeCountEl = document.querySelector(".tab-count-active");
  const archivedCountEl = document.querySelector(".tab-count-archived");

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

  // Render active notes
  if (filteredActive.length === 0) {
    const isSearch = Boolean(query);
    activeNoteList.innerHTML = createEmptyState(
      isSearch ? "Tidak Ditemukan" : "Belum Ada Catatan",
      isSearch
        ? `Tidak ada catatan aktif yang cocok dengan "${currentSearchQuery}"`
        : "Mulai tuangkan ide dan rencanamu sekarang!",
    );
  } else {
    filteredActive.forEach((note, index) => {
      const noteItem = document.createElement("note-item");
      noteItem.noteData = note;
      noteItem.style.opacity = "0";
      activeNoteList.appendChild(noteItem);

      anime({
        targets: noteItem,
        opacity: 1,
        translateY: [24, 0],
        delay: index * 60,
        duration: 450,
        easing: "easeOutCubic",
      });
    });
  }

  // Render archived notes
  if (filteredArchived.length === 0) {
    archivedNoteList.innerHTML = createEmptyState(
      query ? "Tidak Ditemukan" : "Belum Ada Arsip",
      query
        ? `Tidak ada catatan arsip yang cocok dengan "${currentSearchQuery}"`
        : "Catatan yang diarsipkan akan muncul di sini.",
    );
  } else {
    filteredArchived.forEach((note, index) => {
      const noteItem = document.createElement("note-item");
      noteItem.noteData = note;
      noteItem.style.opacity = "0";
      archivedNoteList.appendChild(noteItem);

      anime({
        targets: noteItem,
        opacity: 1,
        translateY: [24, 0],
        delay: index * 60,
        duration: 450,
        easing: "easeOutCubic",
      });
    });
  }

  // Update tab badge counts (always show total, not filtered)
  if (activeCountEl) activeCountEl.textContent = activeNotesData.length;
  if (archivedCountEl) archivedCountEl.textContent = archivedNotesData.length;
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
  // Sun icon for dark mode (switch to light), Moon icon for light mode (switch to dark)
  btn.innerHTML =
    theme === "dark"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

// ============================
// Web Components
// ============================

class AppBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="navbar">
        <div class="navbar-brand">
          <svg class="navbar-logo" width="30" height="30" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="navLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#6366F1"/>
                <stop offset="100%" stop-color="#4338CA"/>
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#navLogoGrad)"/>
            <rect x="15" y="13" width="34" height="38" rx="7" fill="#FFFFFF"/>
            <line x1="22" y1="23" x2="38" y2="23" stroke="#4F46E5" stroke-width="3" stroke-linecap="round"/>
            <line x1="22" y1="31" x2="42" y2="31" stroke="#6366F1" stroke-width="3" stroke-linecap="round"/>
            <line x1="22" y1="39" x2="33" y2="39" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
            <circle cx="41" cy="39" r="2.5" fill="#10B981"/>
          </svg>
          <span class="navbar-title">NotesApp</span>
        </div>
        <div class="search-container">
          <input type="text" class="search-input" id="searchInput" placeholder="Cari catatan..." autocomplete="off" />
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div class="navbar-actions">
          <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode" title="Toggle tema gelap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
        </div>
      </nav>
    `;

    // Search with debounce
    const searchInput = this.querySelector("#searchInput");
    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearchQuery = e.target.value;
        displayNotes();
      }, 200);
    });

    // Theme toggle
    this.querySelector("#themeToggle").addEventListener("click", toggleTheme);
  }
}

class NoteItem extends HTMLElement {
  set noteData(note) {
    this._note = note;
    this.render();
  }

  render() {
    const { id, title, body, createdAt, archived } = this._note;
    this.innerHTML = `
      <div class="note-card ${archived ? "archived" : ""}">
        <div class="note-card-header">
          <h3 class="note-card-title">${title}</h3>
        </div>
        <div class="note-card-body">
          <p class="note-card-text">${body}</p>
        </div>
        <div class="note-card-footer">
          <span class="note-date">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            ${formatDate(createdAt)}
          </span>
          <div class="note-actions">
            <button class="action-btn edit-btn" title="Edit Catatan" aria-label="Edit catatan">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="action-btn archive-btn" title="${archived ? "Pulihkan" : "Arsipkan"}" aria-label="${archived ? "Pulihkan dari arsip" : "Arsipkan catatan"}">
              ${
                archived
                  ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`
                  : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`
              }
            </button>
            <button class="action-btn delete-btn" title="Hapus" aria-label="Hapus catatan">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    this.querySelector(".edit-btn").addEventListener("click", () =>
      this.openEditModal(),
    );
    this.querySelector(".archive-btn").addEventListener("click", () =>
      this.toggleArchive(),
    );
    this.querySelector(".delete-btn").addEventListener("click", () =>
      this.deleteNote(),
    );
  }

  openEditModal() {
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

      anime({
        targets: this,
        opacity: [1, 0],
        translateX: [0, this._note.archived ? -20 : 20],
        scale: [1, 0.95],
        duration: 350,
        easing: "easeInCubic",
        complete: async () => {
          await renderNotes();
          showAlert.success(
            `Catatan berhasil ${
              this._note.archived ? "dipulihkan dari arsip" : "diarsipkan"
            }!`,
          );
        },
      });
    } catch (error) {
      console.error("Error toggling archive:", error);
      showAlert.error(
        `Gagal ${
          this._note.archived ? "memulihkan" : "mengarsipkan"
        } catatan. Silakan coba lagi.`,
      );
    }
  }

  async deleteNote() {
    const confirmed = await showAlert.confirm(
      "Apakah Anda yakin ingin menghapus catatan ini?",
    );
    if (confirmed) {
      try {
        showAlert.loading();

        anime({
          targets: this,
          opacity: 0,
          scale: [1, 0.85],
          duration: 350,
          easing: "easeInCubic",
          complete: async () => {
            await deleteNote(this._note.id);
            await renderNotes();
            showAlert.success("Catatan berhasil dihapus!");
          },
        });
      } catch (error) {
        console.error("Error deleting note:", error);
        showAlert.error("Gagal menghapus catatan. Silakan coba lagi.");
      }
    }
  }
}

class FormNote extends HTMLElement {
  connectedCallback() {
    this._isExpanded = false;
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
      <div class="form-wrapper">
        <div class="form-collapsed" id="formCollapsed">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>Tulis catatan baru...</span>
        </div>
        <form id="noteForm" class="form-expanded" style="display: none;">
          <div class="form-field">
            <input type="text" id="title" name="title" placeholder="Judul Catatan" required autocomplete="off" />
            <small class="field-error" id="titleError"></small>
          </div>
          <div class="form-field">
            <textarea id="body" name="body" rows="4" placeholder="Tulis catatan di sini..." required></textarea>
            <small class="field-error" id="bodyError"></small>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" id="cancelBtn">Batal</button>
            <button type="submit" class="btn btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tambah Catatan
            </button>
          </div>
        </form>
      </div>
    `;
  }

  setupEventListeners() {
    const collapsed = this.querySelector("#formCollapsed");
    const form = this.querySelector("#noteForm");
    const cancelBtn = this.querySelector("#cancelBtn");

    collapsed.addEventListener("click", () => this.expandForm());
    cancelBtn.addEventListener("click", () => this.collapseForm());
    form.addEventListener("input", this.handleRealtimeValidation.bind(this));
    form.addEventListener("submit", this.handleSubmit.bind(this));

    // Collapse on click outside (only if both fields are empty)
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

    anime({
      targets: form,
      opacity: [0, 1],
      translateY: [-8, 0],
      duration: 300,
      easing: "easeOutCubic",
    });

    this.querySelector("#title").focus();
  }

  collapseForm() {
    const collapsed = this.querySelector("#formCollapsed");
    const form = this.querySelector("#noteForm");

    anime({
      targets: form,
      opacity: [1, 0],
      translateY: [0, -8],
      duration: 200,
      easing: "easeInCubic",
      complete: () => {
        form.style.display = "none";
        collapsed.style.display = "flex";
        this._isExpanded = false;
        form.reset();
        this.querySelector("#titleError").textContent = "";
        this.querySelector("#bodyError").textContent = "";
      },
    });
  }

  handleRealtimeValidation() {
    const titleInput = this.querySelector("#title");
    const bodyInput = this.querySelector("#body");
    const titleError = this.querySelector("#titleError");
    const bodyError = this.querySelector("#bodyError");

    titleError.textContent =
      titleInput.value.trim() === "" ? "Judul tidak boleh kosong." : "";
    bodyError.textContent =
      bodyInput.value.trim() === "" ? "Isi catatan tidak boleh kosong." : "";
  }

  async handleSubmit(event) {
    event.preventDefault();

    const titleInput = this.querySelector("#title");
    const bodyInput = this.querySelector("#body");

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (title && body) {
      try {
        showAlert.loading();
        await addNote(title, body);
        await renderNotes();
        showAlert.success("Catatan berhasil ditambahkan!");
        this.collapseForm();
      } catch (error) {
        console.error("Error adding note:", error);
        showAlert.error("Gagal menambahkan catatan. Silakan coba lagi.");
      }
    }
  }
}

class NotesSection extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupTabs();
  }

  render() {
    this.innerHTML = `
      <div class="section-container">
        <div class="tabs-container">
          <button class="tab active" data-tab="active">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Catatan Aktif
            <span class="tab-badge tab-count-active">0</span>
          </button>
          <button class="tab" data-tab="archived">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="21 8 21 21 3 21 3 8"/>
              <rect x="1" y="3" width="22" height="5"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            Arsip
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
    const panes = this.querySelectorAll(".tab-pane");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Update tab active states
        tabs.forEach((t) => t.classList.remove("active"));
        panes.forEach((p) => p.classList.remove("active"));

        tab.classList.add("active");
        const target = tab.getAttribute("data-tab");
        currentTab = target;

        const pane =
          target === "active"
            ? this.querySelector("#activePane")
            : this.querySelector("#archivedPane");
        pane.classList.add("active");
      });
    });
  }
}

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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <h3 class="modal-title" id="modalTitle">Edit Catatan</h3>
            </div>
            <button type="button" class="modal-close-btn" id="closeModalBtn" aria-label="Tutup modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form id="editForm" class="modal-form">
            <div class="form-field">
              <label for="editTitle" class="form-label">Judul Catatan</label>
              <input type="text" id="editTitle" name="title" placeholder="Judul catatan" required autocomplete="off" />
              <small class="field-error" id="editTitleError"></small>
            </div>
            <div class="form-field">
              <label for="editBody" class="form-label">Isi Catatan</label>
              <textarea id="editBody" name="body" rows="6" placeholder="Tulis catatan di sini..." required></textarea>
              <small class="field-error" id="editBodyError"></small>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" id="cancelEditBtn">Batal</button>
              <button type="submit" class="btn btn-primary" id="saveEditBtn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Simpan Perubahan
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
      if (e.target === backdrop) {
        this.close();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && backdrop.classList.contains("open")) {
        this.close();
      }
    });

    form.addEventListener("input", this.handleValidation.bind(this));
    form.addEventListener("submit", this.handleSubmit.bind(this));
  }

  open(note) {
    this._currentNote = note;
    const backdrop = this.querySelector("#editBackdrop");
    const titleInput = this.querySelector("#editTitle");
    const bodyInput = this.querySelector("#editBody");
    const titleError = this.querySelector("#editTitleError");
    const bodyError = this.querySelector("#editBodyError");

    titleInput.value = note.title;
    bodyInput.value = note.body;
    titleError.textContent = "";
    bodyError.textContent = "";

    backdrop.classList.add("open");

    const dialog = this.querySelector("#editDialog");
    anime({
      targets: dialog,
      scale: [0.92, 1],
      opacity: [0, 1],
      duration: 250,
      easing: "easeOutCubic",
    });

    setTimeout(() => titleInput.focus(), 50);
  }

  close() {
    const backdrop = this.querySelector("#editBackdrop");
    const dialog = this.querySelector("#editDialog");

    anime({
      targets: dialog,
      scale: [1, 0.92],
      opacity: [1, 0],
      duration: 180,
      easing: "easeInCubic",
      complete: () => {
        backdrop.classList.remove("open");
        this._currentNote = null;
      },
    });
  }

  handleValidation() {
    const titleInput = this.querySelector("#editTitle");
    const bodyInput = this.querySelector("#editBody");
    const titleError = this.querySelector("#editTitleError");
    const bodyError = this.querySelector("#editBodyError");

    titleError.textContent =
      titleInput.value.trim() === "" ? "Judul tidak boleh kosong." : "";
    bodyError.textContent =
      bodyInput.value.trim() === "" ? "Isi catatan tidak boleh kosong." : "";
  }

  async handleSubmit(event) {
    event.preventDefault();
    if (!this._currentNote) return;

    const titleInput = this.querySelector("#editTitle");
    const bodyInput = this.querySelector("#editBody");

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || !body) {
      this.handleValidation();
      return;
    }

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
      showAlert.success("Catatan berhasil diperbarui!");
    } catch (error) {
      console.error("Error updating note:", error);
      showAlert.error("Gagal memperbarui catatan. Silakan coba lagi.");
    }
  }
}

// ============================
// Register Custom Elements
// ============================
customElements.define("app-bar", AppBar);
customElements.define("note-item", NoteItem);
customElements.define("form-note", FormNote);
customElements.define("notes-section", NotesSection);
customElements.define("edit-modal", EditModal);

// ============================
// App Init
// ============================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderNotes();

  // Entrance animations
  anime({
    targets: "app-bar",
    translateY: [-20, 0],
    opacity: [0, 1],
    duration: 500,
    easing: "easeOutCubic",
  });

  anime({
    targets: "form-note",
    translateY: [16, 0],
    opacity: [0, 1],
    duration: 500,
    delay: 150,
    easing: "easeOutCubic",
  });

  anime({
    targets: "notes-section",
    translateY: [16, 0],
    opacity: [0, 1],
    duration: 500,
    delay: 300,
    easing: "easeOutCubic",
  });
});
