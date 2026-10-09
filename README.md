# MediCore Hospital Management System

MediCore adalah aplikasi manajemen rumah sakit berbasis web dengan fitur
autentikasi admin, dokter, dan pasien; pengaturan jadwal dokter; appointment;
resep; dan dashboard administrasi.

## Teknologi

- **Frontend:** React, React Router, Tailwind CSS, dan Lucide React.
- **Backend:** Node.js, Express, JWT, bcrypt, dan dotenv.
- **Database:** MongoDB dengan Mongoose.
- **Container:** Docker dan Docker Compose.

## Struktur Project

```text
.
├── backend/             # API Node.js + Express
├── frontend/            # Aplikasi React
├── Dockerfile           # Image app: frontend build + backend
├── docker-compose.yml   # App, MongoDB, dan Ubuntu OS
└── .dockerignore
```

## Arsitektur Docker

Project ini menyediakan tiga container:

| Container | Isi | Port |
| --- | --- | --- |
| `medicore-app` | Frontend React hasil build dan backend Node.js + Express | `5000` |
| `medicore-mongodb` | Database MongoDB | `27017` |
| `medicore-os` | Ubuntu 22.04 | - |

Container `os` berdiri sendiri untuk memenuhi kebutuhan praktikum. Container
tersebut bukan host untuk container aplikasi atau database. Setiap container
tetap menggunakan base image Linux-nya sendiri.

Alur aplikasi:

```text
Browser
  ↓ http://localhost:5000
medicore-app
  ├── React static build
  └── Express REST API
        ↓ mongodb://mongodb:27017/medicore
medicore-mongodb
```

## Prasyarat

Untuk menjalankan versi Docker:

- Docker Desktop.
- Docker Compose Plugin.
- Git, jika repository diambil dari GitHub.

Pastikan Docker Desktop sudah berjalan sebelum menjalankan perintah Docker.
Verifikasi dengan:

```powershell
docker info
```

Jika bagian `Server` menampilkan informasi Docker Engine, Docker siap
digunakan.

## Menjalankan dengan Docker

### 1. Clone repository

```powershell
git clone https://github.com/dericktjoa/Uncontainered_MediCore.git
cd Uncontainered_MediCore
```

Jika folder lokal project sudah ada, cukup buka PowerShell pada folder tersebut.

### 2. Build dan jalankan semua container

```powershell
docker compose up -d --build
```

Perintah ini akan:

1. Membuat production build frontend React.
2. Menginstal dependency production backend.
3. Membuat image `app`.
4. Mengambil image MongoDB dan Ubuntu.
5. Membuat network Docker.
6. Menjalankan tiga container.
7. Menunggu MongoDB sehat sebelum container app dijalankan.

### 3. Periksa status container

```powershell
docker compose ps
```

Container yang diharapkan:

```text
medicore-app
medicore-mongodb
medicore-os
```

### 4. Buat data awal admin dan dokter

Jalankan satu kali pada database baru:

```powershell
docker compose exec app node createAdmin.js
docker compose exec app node createDoctors.js
```

Perintah tersebut dijalankan dari working directory backend di dalam
container `app`. Jika email admin atau dokter sudah pernah dibuat, error
duplicate dapat muncul dan script tersebut tidak perlu dijalankan ulang.

### 5. Buka aplikasi

Buka browser pada:

```text
http://localhost:5000
```

Frontend React dan API backend menggunakan container yang sama:

```text
http://localhost:5000/          # Frontend
http://localhost:5000/login     # Halaman login
http://localhost:5000/api/login # API login
```

### 6. Melihat log

```powershell
docker compose logs -f app
docker compose logs -f mongodb
```

Tekan `Ctrl+C` untuk berhenti melihat log tanpa menghentikan container.

### 7. Menghentikan aplikasi

Menghentikan container tanpa menghapus data:

```powershell
docker compose down
```

Menghentikan container dan menghapus volume MongoDB:

```powershell
docker compose down -v
```

Perintah `down -v` akan menghapus seluruh data database lokal. Gunakan hanya
jika ingin memulai dari database kosong.

## Akun dan Pengujian Fitur

### Admin

Data akun admin dibuat oleh `backend/createAdmin.js`. Periksa file tersebut
untuk email dan password yang digunakan pada environment lokal.

Admin dapat:

- Melihat dashboard statistik.
- Melihat jumlah dokter dan pasien.
- Menambahkan dokter.
- Menambahkan admin.
- Mengubah profil.
- Mengelola status pasien.

### Dokter

Data dokter dibuat oleh `backend/createDoctors.js`. Password default dokter
yang digunakan script adalah:

```text
Doctor123!
```

Dokter dapat:

- Membuat dan menghapus jadwal.
- Melihat appointment.
- Menyelesaikan appointment.
- Melihat pasien.
- Membuat, mengedit, dan menghapus resep.
- Mengubah profil.

### Pasien

Pasien dibuat melalui menu **Sign Up**. Pasien dapat:

- Melihat daftar dokter.
- Melihat slot yang tersedia.
- Membuat dan membatalkan appointment.
- Memulihkan appointment yang dibatalkan.
- Melihat care team.
- Melihat resep.
- Mengubah profil.

Urutan pengujian yang disarankan:

```text
1. Jalankan container.
2. Buat data awal admin dan dokter.
3. Login sebagai dokter dan buat jadwal.
4. Buat akun pasien melalui Sign Up.
5. Login sebagai pasien dan buat appointment.
6. Login sebagai dokter dan periksa appointment pasien.
7. Buat resep dari dashboard dokter.
8. Login sebagai pasien dan periksa resep.
9. Login sebagai admin dan periksa dashboard.
```

## Menjalankan Tanpa Docker

### Prasyarat

- Node.js LTS dan npm.
- MongoDB Community Server.

### Backend

Buat file `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/medicore
PORT=5000
```

Jalankan:

```powershell
cd backend
npm install
npm run data
npm start
```

Backend tersedia di `http://localhost:5000`.

### Frontend

Buat file `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

Pada terminal lain:

```powershell
cd frontend
npm install
npm start
```

Frontend development tersedia di `http://localhost:3000`.

## Konfigurasi Docker

Pada Docker Compose, backend menggunakan:

```text
MONGO_URI=mongodb://mongodb:27017/medicore
PORT=5000
```

Hostname `mongodb` adalah nama service Docker Compose, bukan `localhost`.
Frontend production menggunakan URL API relatif seperti `/api/login`, sehingga
frontend dan backend dapat disajikan melalui port `5000` yang sama.

Database menggunakan named volume:

```text
mongodb-data
```

Volume tersebut membuat data tetap ada setelah `docker compose down`.

## Troubleshooting

### Docker API tidak dapat terhubung

Error seperti berikut berarti Docker Engine belum berjalan:

```text
failed to connect to the docker API
```

Solusi:

1. Jalankan Docker Desktop.
2. Tunggu sampai status Docker Desktop menunjukkan engine siap.
3. Jalankan `docker info`.
4. Ulangi `docker compose up -d --build`.

Pada Windows, context yang umum digunakan adalah:

```powershell
docker context use desktop-linux
```

### Container tidak berjalan

Periksa log:

```powershell
docker compose ps
docker compose logs app
docker compose logs mongodb
```

### Frontend tidak dapat mengakses API

Pastikan frontend dibuka melalui:

```text
http://localhost:5000
```

Jangan menggunakan `http://localhost:3000` ketika memakai mode Docker
production.

### MongoDB tidak tersedia

Pastikan healthcheck MongoDB sudah `healthy`:

```powershell
docker compose ps
docker compose logs mongodb
```

### Data awal duplicate

Jika admin atau dokter sudah pernah dibuat, jangan jalankan script seed
berulang kali. Untuk mengulang dari database kosong:

```powershell
docker compose down -v
docker compose up -d --build
docker compose exec app node createAdmin.js
docker compose exec app node createDoctors.js
```

## Push Perubahan ke GitHub

### 1. Periksa file yang akan dikirim

Jalankan dari root project:

```powershell
git status
```

File yang seharusnya ikut dikirim antara lain:

```text
README.md
Dockerfile
docker-compose.yml
.dockerignore
backend/server.js
```

File berikut tidak boleh dikirim:

```text
node_modules/
frontend/build/
backend/.env
frontend/.env
mongodb-data/
```

Aturan tersebut sudah dicantumkan di `.gitignore` dan `.dockerignore`.

### 2. Tambahkan file ke staging

```powershell
git add README.md Dockerfile docker-compose.yml .dockerignore backend/server.js
```

Jika ingin memasukkan dokumentasi Markdown yang dibuat:

```powershell
git add TEKNOLOGI-APLIKASI.md info-detail-apk.md
```

Periksa staging:

```powershell
git diff --cached --stat
git diff --cached --check
```

### 3. Commit

```powershell
git commit -m "Add Docker deployment for MediCore" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Jika Git meminta identitas:

```powershell
git config user.name "Nama Anda"
git config user.email "email-anda@example.com"
```

### 4. Push ke GitHub

Pastikan remote mengarah ke repository yang benar:

```powershell
git remote -v
```

Kemudian push branch `main`:

```powershell
git push -u origin main
```

Jika diminta login, gunakan autentikasi GitHub yang tersedia. Password akun
GitHub biasa tidak digunakan untuk Git over HTTPS; gunakan GitHub CLI,
credential manager, atau personal access token sesuai konfigurasi Anda.

### 5. Verifikasi di GitHub

Setelah push selesai:

1. Buka repository GitHub.
2. Pastikan `README.md` menampilkan instruksi Docker terbaru.
3. Pastikan `Dockerfile`, `docker-compose.yml`, dan `.dockerignore` tersedia.
4. Pastikan file `.env`, `node_modules`, build output, dan data MongoDB tidak
   ikut muncul.

## Keamanan

- Jangan commit file `.env`.
- Jangan commit password akun default.
- Jangan commit JWT secret.
- Ganti password default dokter pada environment nyata.
- Pindahkan secret JWT dari source code ke environment variable sebelum
  deployment production.
- Batasi CORS dan gunakan HTTPS pada deployment publik.

## Lisensi

Project ini digunakan untuk kebutuhan pembelajaran dan praktikum.
