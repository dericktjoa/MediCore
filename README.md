# MediCore

MediCore adalah aplikasi manajemen rumah sakit berbasis web untuk mengelola
pasien, dokter, appointment, jadwal dokter, dan resep obat. Aplikasi ini
memiliki tiga jenis pengguna: pasien, dokter, dan admin.

## Download dan Menjalankan dengan Docker

### 1. Clone repository

```powershell
git clone https://github.com/dericktjoa/MediCore.git
cd MediCore
```

### 2. Build dan jalankan aplikasi

Salin `.env.example` menjadi `.env`, isi `JWT_SECRET` dengan secret lokal,
lalu ambil image aplikasi dari Docker Hub:

```powershell
Copy-Item .env.example .env
docker compose pull
docker compose up -d
```

Compose mengambil image `plankboard/medicore:latest`, image MongoDB, dan image
Ubuntu, lalu menjalankan seluruh service.

### 3. Periksa container

```powershell
docker compose ps
```

Container yang dijalankan:

```text
medicore-app
medicore-mongodb
medicore-os
```

`medicore-app` menjalankan frontend React dan backend Express. `medicore-mongodb`
menyimpan database pada named volume. `medicore-os` dipertahankan sebagai
container Ubuntu untuk demonstrasi lifecycle container; container ini tidak
menjadi dependency aplikasi.

Verifikasi aplikasi:

```powershell
docker compose ps
curl.exe --fail http://localhost:5000/healthz
```

### 4. Tambahkan data admin dan dokter

Jalankan perintah berikut setelah MongoDB berstatus `healthy`:

```powershell
docker compose exec app node createAdmin.js
docker compose exec app node createDoctors.js
```

Atau jalankan keduanya melalui script backend:

```powershell
docker compose exec app npm run data
```

Data admin dibuat dari [createAdmin.js](backend/createAdmin.js). Kredensial
default yang saat ini digunakan script tersebut adalah:

```text
Email    : abc@gmail.com
Password : xyz123
```

Data dokter dibuat dari [createDoctors.js](backend/createDoctors.js). Script
tersebut membuat delapan akun dokter dengan password default:

```text
Password : Doctor123!
```

### 5. Buka aplikasi

Buka alamat berikut di browser:

```text
http://localhost:5000
```

Frontend production dan REST API tersedia melalui container aplikasi yang sama.

### 6. Lihat log

```powershell
docker compose logs -f app
docker compose logs -f mongodb
```

Tekan `Ctrl+C` untuk berhenti melihat log tanpa menghentikan container.

## Menghentikan dan Menghapus Container

Menghentikan dan menghapus container serta network tanpa menghapus data
MongoDB:

```powershell
docker compose down
```

Menghapus container, network, dan volume database sehingga seluruh data lokal
terhapus:

```powershell
docker compose down -v
```

Setelah `down -v`, jalankan kembali aplikasi dan seed data jika ingin memulai
dari database kosong:

```powershell
docker compose pull
docker compose up -d
docker compose exec app npm run data
```

## Fitur Aplikasi

### Pasien

- Dashboard pasien yang menampilkan ringkasan aktivitas.
- Menampilkan appointment hari ini.
- Menampilkan resep atau obat yang masih aktif.
- Menampilkan dokter yang sedang atau pernah menangani pasien.
- Profile pasien yang menampilkan nama dan email.
- Memperbarui data profile pasien.
- Melihat daftar dokter dan slot jadwal yang tersedia.
- Membuat appointment dengan memilih dokter, tanggal, waktu, dan alasan
  kunjungan.
- Melihat detail appointment dan resep dari dokter.
- Membatalkan appointment dan memulihkan appointment yang dibatalkan.
- Membuat akun melalui menu **Sign Up**.

### Dokter

- Dashboard dokter yang menampilkan appointment hari ini.
- Menampilkan jumlah pasien yang ditangani.
- Profile dokter yang menampilkan nama, email, spesialisasi, nomor lisensi,
  dan nomor telepon.
- Memperbarui data profile dokter.
- Menentukan jadwal praktik dan menghapus jadwal.
- Melihat pasien yang melakukan booking sesuai jadwal dokter.
- Melihat appointment dan mengubah status appointment hingga selesai.
- Menjadwalkan kunjungan pasien melalui **Schedule Appointment**.
- Memberikan resep melalui **Prescribe Medication**.
- Menentukan nama obat, dosis, frekuensi penggunaan, dan instruksi penggunaan.
- Membuat, mengubah, dan menghapus resep.

### Admin

- Dashboard admin yang menampilkan ringkasan kondisi rumah sakit.
- Menampilkan jumlah dokter.
- Menampilkan jumlah pasien.
- Menampilkan tingkat penggunaan tempat tidur.
- Profile admin yang menampilkan nama dan email.
- Memperbarui data profile admin.
- Menambahkan akun dokter dengan data yang diperlukan.
- Menambahkan akun admin baru.
- Mengelola status pasien.

## Teknologi

- **Frontend:** React 18, React Router, Tailwind CSS, dan Lucide React.
- **Backend:** Node.js 20, Express, JWT, bcrypt, CORS, dan dotenv.
- **Database:** MongoDB 7 dengan Mongoose.
- **Build dan deployment:** Docker, Docker Compose, Docker Hub, dan
  multi-stage Dockerfile.
- **OS demo container:** Ubuntu 22.04.

## Arsitektur Project

```text
Browser
   │
   ▼
medicore-app :5000
   ├── React production build
   └── Express REST API
          │
          ▼
medicore-mongodb :27017
```

`medicore-app` menyajikan frontend React dan API backend dalam satu container.
Backend terhubung ke MongoDB melalui hostname service Docker Compose
`mongodb`, bukan `localhost`. Database menggunakan named volume
`mongodb-data` agar data tetap tersedia setelah `docker compose down`.

`medicore-os` menggunakan image Ubuntu 22.04 dan menjalankan `sleep infinity`
agar lifecycle container dapat diperagakan tanpa mengganggu aplikasi.

## Struktur Folder

```text
.
├── backend/                 # REST API, autentikasi, model, route, dan seed data
│   ├── models/              # Schema MongoDB untuk admin, dokter, pasien, dan data lain
│   ├── routes/              # Endpoint API berdasarkan peran pengguna
│   ├── createAdmin.js       # Membuat akun admin awal
│   ├── createDoctors.js     # Membuat akun dokter awal
│   ├── resetData.js         # Reset data lokal
│   └── server.js            # Entry point Express dan static frontend
├── frontend/                # Source code aplikasi React
│   ├── public/               # Asset publik dan template HTML
│   └── src/                  # Komponen, halaman, style, dan pengujian frontend
├── Dockerfile                # Multi-stage build frontend dan backend
├── docker-compose.yml        # Definisi app, MongoDB, Ubuntu, network, dan volume
├── .dockerignore             # File yang dikecualikan dari Docker build context
├── .env.example              # Template environment tanpa secret
└── .github/workflows/ci-cd.yml # CI dan publish image Docker Hub
```

## CI/CD

Workflow [ci-cd.yml](.github/workflows/ci-cd.yml) menjalankan CI pada pull
request dan push ke `main`. CI menjalankan test frontend, build frontend,
test backend, dan Docker build. Pada push ke `main`, tahap publish mengirim
image dengan tag `latest` dan commit SHA ke Docker Hub setelah CI berhasil.

Tambahkan GitHub repository secrets berikut:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

## Konfigurasi Docker

Konfigurasi service aplikasi menggunakan file `.env` lokal:

```text
DOCKERHUB_USERNAME=plankboard
APP_VERSION=latest
MONGO_URI=mongodb://mongodb:27017/medicore
PORT=5000
JWT_SECRET=replace-with-a-local-random-secret
```

Frontend production menggunakan URL API relatif seperti `/api/login`, sehingga
frontend dan backend dapat diakses melalui `http://localhost:5000`.

## Lifecycle container

```powershell
docker compose logs app
docker inspect medicore-app
docker stop medicore-app
docker start medicore-app
docker compose down
docker compose pull
docker compose up -d
```

`docker stop` menghentikan container tanpa menghapusnya. `docker start`
menjalankan kembali container yang sama. `docker compose down` menghapus
container dan network, tetapi tidak menghapus volume `mongodb-data`.
Jangan gunakan `docker compose down -v` karena akan menghapus data MongoDB.

CI berjalan pada GitHub-hosted runner dengan Docker daemon milik runner.
CD lokal dijalankan manual pada komputer yang memiliki Docker daemon lokal:

```text
docker compose pull
docker compose up -d
```

GitHub-hosted runner tidak dapat mengakses Docker daemon komputer lokal, dan
self-hosted runner tidak diperlukan untuk tugas ini.
