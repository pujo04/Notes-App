import "./styles.css";
import {
  getNotes,
  getArchivedNotes,
  addNote,
  deleteNote,
  archiveNote,
  unarchiveNote,
} from "./api.js";
import { showAlert } from "./alert.js";

async function renderNotes() {
  const activeNoteList = document.querySelector(".active-notes");
  const archivedNoteList = document.querySelector(".archived-notes");
  const noteCounts = document.querySelectorAll(".note-count");

  activeNoteList.innerHTML = "";
  archivedNoteList.innerHTML = "";

  try {
    showAlert.loading();
    const [activeNotes, archivedNotes] = await Promise.all([
      getNotes(),
      getArchivedNotes(),
    ]);

    if (activeNotes.length === 0) {
      activeNoteList.innerHTML =
        '<div class="empty-notes">Tidak ada catatan aktif</div>';
    } else {
      activeNotes.forEach((note, index) => {
        const noteItem = document.createElement("note-item");
        noteItem.noteData = note;
        noteItem.style.opacity = 0;
        activeNoteList.appendChild(noteItem);

        anime({
          targets: noteItem,
          opacity: 1,
          translateY: [50, 0],
          delay: index * 100,
          duration: 500,
          easing: "easeOutQuad",
        });
      });
    }

    if (archivedNotes.length === 0) {
      archivedNoteList.innerHTML =
        '<div class="empty-notes">Tidak ada catatan yang diarsipkan</div>';
    } else {
      archivedNotes.forEach((note, index) => {
        const noteItem = document.createElement("note-item");
        noteItem.noteData = note;
        noteItem.style.opacity = 0;
        archivedNoteList.appendChild(noteItem);

        anime({
          targets: noteItem,
          opacity: 1,
          translateY: [50, 0],
          delay: index * 100,
          duration: 500,
          easing: "easeOutQuad",
        });
      });
    }

    noteCounts[0].textContent = activeNotes.length;
    noteCounts[1].textContent = archivedNotes.length;
  } catch (error) {
    console.error("Error rendering notes:", error);
    showAlert.error("Gagal memuat catatan. Silakan coba lagi.");
  } finally {
    showAlert.close();
  }
}

class AppBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<h2>Notes App</h2>`;
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
        <h3>${title}</h3>
        <p>${body}</p>
        <small>Dibuat pada: ${new Date(createdAt).toLocaleString()}</small>
        <div class="note-actions">
          <button class="archive-btn">${
            archived ? "Batal Arsip" : "Arsipkan"
          }</button>
          <button class="delete-btn">Hapus</button>
        </div>
      </div>
    `;

    this.querySelector(".archive-btn").addEventListener("click", () =>
      this.toggleArchive(),
    );
    this.querySelector(".delete-btn").addEventListener("click", () =>
      this.deleteNote(),
    );
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
        rotateY: "180deg",
        duration: 500,
        easing: "easeInOutQuad",
        complete: async () => {
          await renderNotes();
          showAlert.success(
            `Catatan berhasil ${
              this._note.archived ? "dibatalkan dari arsip" : "diarsipkan"
            }!`,
          );
        },
      });
    } catch (error) {
      console.error("Error toggling archive:", error);
      showAlert.error(
        `Gagal ${
          this._note.archived ? "membatalkan arsip" : "mengarsipkan"
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
          translateX: 100,
          duration: 500,
          easing: "easeOutQuad",
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
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
      <form id="noteForm">
        <label for="title">Judul Catatan:</label>
        <input type="text" id="title" name="title" placeholder="Masukkan judul catatan" required>
        <small class="error" id="titleError"></small>
        
        <label for="body">Isi Catatan:</label>
        <textarea id="body" name="body" rows="5" placeholder="Masukkan isi catatan" required></textarea>
        <small class="error" id="bodyError"></small>

        <button type="submit">Tambah Catatan</button>
      </form>
    `;
  }

  setupEventListeners() {
    this.querySelector("#noteForm").addEventListener(
      "input",
      this.handleRealtimeValidation.bind(this),
    );
    this.querySelector("#noteForm").addEventListener(
      "submit",
      this.handleSubmit.bind(this),
    );
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
        titleInput.value = "";
        bodyInput.value = "";

        anime({
          targets: this,
          translateY: [-20, 0],
          opacity: [0.5, 1],
          duration: 500,
          easing: "easeOutQuad",
        });
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
  }

  render() {
    this.innerHTML = `
      <div class="note-section">
        <h2>Catatan Aktif (<span class="note-count">0</span>)</h2>
        <div class="note-list-grid active-notes"></div>
      </div>
      <div class="note-section">
        <h2>Catatan Arsip (<span class="note-count">0</span>)</h2>
        <div class="note-list-grid archived-notes"></div>
      </div>
    `;
  }
}

customElements.define("app-bar", AppBar);
customElements.define("note-item", NoteItem);
customElements.define("form-note", FormNote);
customElements.define("notes-section", NotesSection);

document.addEventListener("DOMContentLoaded", () => {
  renderNotes();

  anime({
    targets: "app-bar",
    translateY: [-50, 0],
    opacity: [0, 1],
    duration: 1000,
    easing: "easeOutQuad",
  });

  anime({
    targets: "form-note",
    translateY: [50, 0],
    opacity: [0, 1],
    duration: 1000,
    delay: 300,
    easing: "easeOutQuad",
  });

  anime({
    targets: "notes-section",
    translateY: [50, 0],
    opacity: [0, 1],
    duration: 1000,
    delay: 600,
    easing: "easeOutQuad",
  });
});
