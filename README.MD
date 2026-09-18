# 📝 **Notes App**  

Notes App is a comprehensive web-based note-taking application designed to provide users with a seamless and intuitive experience for creating, managing, and organizing personal notes. Leveraging modern web development technologies, the application utilizes Webpack as a module bundler, implements RESTful API integration for dynamic data management, and employs web components to create a modular and interactive user interface. The app features real-time form validation, a responsive grid layout using CSS Grid, and asynchronous data fetching with the Fetch API, ensuring smooth performance across various devices. Users can create, view, archive, and delete notes with intuitive loading indicators and error handling, while optional enhancements include smooth animations and a clean, aesthetically pleasing design. The project emphasizes code quality through the use of code formatters like Prettier and focuses on delivering a user-friendly, accessible, and performant note-taking solution that meets both mandatory and optional development criteria.  

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
