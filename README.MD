# 🌻 **CozyNotes — Jurnal & Catatan Harian Interaktif**

**CozyNotes** is a modern, charming, and interactive web-based daily journal and note-taking planner designed to transform everyday productivity into a comforting and delightful ritual. Built with modern web development standards, the application leverages **Webpack** as a module bundler, native **Web Components** (`<app-bar>`, `<mood-greeting>`, `<form-note>`, `<notes-section>`, `<note-item>`, `<picnic-checklist>`, `<cozy-soundboard>`, `<edit-modal>`) for encapsulated UI elements, and asynchronous RESTful API integration with the **Dicoding Notes API v2** for reliable cloud synchronization.

Featuring a curated pastel and warm-milk aesthetic with Google Fonts (**Fredoka** and **Quicksand**), responsive CSS Grid layouts, and cheerful micro-animations, CozyNotes elevates personal organization with an interactive **Daily Mood Tracker**, customizable **Digital Sticker Annotations**, **Washi-Tape Pinned Notes**, and a **Daily Checklist (To-Do)** widget with celebratory floating flower petal particle effects powered by Anime.js. To foster a peaceful creative environment, the app includes a real-time **Web Audio API Ambient Soundscape Player** featuring melodious songbirds (Canary, Nightingale, and Robin duet with natural garden room acoustics), a gentle warm breeze, and relaxing pentatonic chimes—100% offline and synthesized in the browser. Users can effortlessly create, search, read full notes without truncation via an intuitive detail modal dialog, edit, archive, and delete notes with real-time validation and custom SweetAlert2 notifications, delivering a harmonious blend of technical rigor, accessibility, and delightful user experience.

---

### 🇮🇩 **Tentang Proyek (Bahasa Indonesia)**
**CozyNotes** adalah aplikasi jurnal harian dan pencatatan berbasis web yang dirancang dengan konsep *Cozy & Playful Planner* untuk menghadirkan pengalaman mencatat yang hangat, menyenangkan, dan menenangkan. Menggabungkan standar kurikulum pengembangan web modern, aplikasi ini mengimplementasikan Webpack sebagai *module bundler*, arsitektur modular berbasis Web Components (*custom elements*), serta integrasi RESTful API asinkron menggunakan Fetch API yang terhubung langsung ke server Dicoding Notes API v2.

Dengan identitas visual bernuansa *Warm Milk & Sunny Pastel*, tipografi ramah (*Fredoka* & *Quicksand*), tata letak responsif menggunakan CSS Grid, dan animasi mikro yang hidup, CozyNotes memperkaya produktivitas sehari-hari melalui fitur penjejak suasana hati (*Daily Mood Tracker*), pemilih stiker digital interaktif, memo bersemat selotip washi tape, serta daftar rencana harian (*Daily Checklist*) beranimasi kelopak bunga mekar. Menghadirkan ketenangan saat bekerja, aplikasi ini dilengkapi pemutar suasana santai (*Cozy Soundboard*) berbasis Web Audio API offline dengan kicauan burung penyanyi merdu, semilir angin taman, dan kotak musik pentatonik. Pengguna dapat menulis ide, membaca catatan lengkap secara utuh melalui pop-up modal dialog, mengedit, mengarsipkan, mencari, serta menghapus catatan dengan indikator interaktif dan notifikasi SweetAlert2 yang elegan.

---

## 🎯 **Tujuan Proyek**  
Proyek ini bertujuan untuk melatih Anda dalam:  
- Membuat aplikasi dengan fitur CRUD (Create, Read, Update, Delete).  
- Mengelola data menggunakan RESTful API.  
- Menggunakan *module bundler* seperti webpack.  
- Membuat antarmuka pengguna yang responsif dan menarik.  

---

## 🛠️ **Kriteria Wajib Proyek**  
### **Fase Awal **  
1. **Daftar Catatan**  
   - Aplikasi harus dapat menampilkan daftar catatan dari data dummy yang disediakan.  

2. **Formulir Tambah Catatan**  
   - Formulir harus memiliki input untuk **judul** dan **isi catatan** (gunakan `<textarea>` untuk isi).  

3. **CSS Grid untuk Layouting**  
   - Gunakan CSS Grid untuk menyusun tata letak daftar catatan.  

4. **Web Component**  
   - Minimal gunakan tiga *custom elements*, seperti untuk daftar catatan, form, atau navigasi.  

---

### **Fase Akhir**  
1. **RESTful API sebagai Sumber Data**  
   - Gunakan **[Notes API](https://notes-api.dicoding.dev/v2)** sebagai sumber data utama.  
   - Fitur yang harus diimplementasikan:  
     - Tambah catatan baru.  
     - Tampilkan daftar catatan.  
     - Hapus catatan.  

2. **Webpack sebagai Module Bundler**  
   - Aplikasi harus dapat dijalankan untuk:  
     - **Development**: `npm run start-dev` dengan `webpack-dev-server`.  
     - **Production**: `npm run build` untuk *build*.  

3. **Fetch API**  
   - Gunakan **Fetch API** untuk permintaan HTTP asinkron.  

4. **Indikator Loading**  
   - Tampilkan indikator loading saat aplikasi sedang memproses data (misalnya saat menambah catatan).  

---

## 🌟 **Kriteria Opsional**  
1. **Tampilan yang Menarik**  
   - Gunakan warna yang pas, font yang mudah dibaca, dan layout yang rapi.  

2. **Validasi Formulir Realtime**  
   - Tambahkan validasi langsung pada formulir (contoh: menampilkan pesan jika input kosong).  

3. **Fitur Arsip Catatan**  
   - Implementasikan fitur arsip untuk memindahkan catatan ke daftar arsip.  

4. **Pesan Error yang Jelas**  
   - Tampilkan notifikasi saat terjadi kesalahan (contoh: menggunakan `alert()` atau library seperti SweetAlert2).  

5. **Animasi yang Halus**  
   - Tambahkan animasi untuk pengalaman pengguna yang lebih menarik.  

6. **Responsive Design**  
   - Pastikan aplikasi Anda dapat diakses dengan baik pada perangkat apa pun.  

7. **Gunakan Prettier**  
   - Rapi dan standarkan kode Anda menggunakan Prettier.  

---

## 🔧 **Teknologi yang Digunakan**  
- **HTML, CSS, JavaScript**: Dasar pengembangan aplikasi.  
- **Webpack**: Untuk modularisasi dan bundling.  
- **Fetch API**: Berinteraksi dengan RESTful API.  
- **CSS Grid**: Layouting.  
- **Web Component**: Membuat UI yang reusable.  

---

## 🚀 **Cara Menjalankan Aplikasi**  

1. **Clone Repository**  
   ```bash
   git clone https://github.com/username/notes-app.git
   cd notes-app
   ```  

2. **Instal Dependensi**  
   ```bash
   npm install
   ```  

3. **Fase Development**  
   ```bash
   npm run start-dev
   ```  

4. **Build untuk Production**  
   ```bash
   npm run build
   ```  

---

## 📬 **Kontak**  
📧 **[andreaspujos8@gmail.com]**  
