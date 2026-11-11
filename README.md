# MediCore

MediCore adalah aplikasi manajemen rumah sakit berbasis web untuk mengelola
pasien, dokter, appointment, jadwal dokter, dan resep obat. Aplikasi memiliki
tiga jenis pengguna: pasien, dokter, dan admin.

Frontend React dan backend Express berjalan dalam satu container aplikasi.
MongoDB tetap berjalan sebagai container terpisah.

## Prasyarat

- Docker Desktop atau Docker Engine yang sedang berjalan.
- PowerShell untuk contoh command di bawah.
- Port `5000` dan `27017` tersedia di komputer lokal.

Periksa instalasi Docker:

```powershell
docker version
docker compose version
```

## Menjalankan dengan Docker Compose

File `docker-compose.yml` mendefinisikan service, network, volume, port, dan
environment variable. Service aplikasi menggunakan image Docker Hub sesuai
`DOCKERHUB_USERNAME` dan `APP_VERSION`.

Salin template environment:

```powershell
Copy-Item .env.example .env
```

Isi `.env` dengan tag dan secret yang digunakan:

```text
DOCKERHUB_USERNAME=plankboard
APP_VERSION=1.0.0
MONGO_URI=mongodb://mongodb:27017/medicore
PORT=5000
JWT_SECRET=ganti-dengan-secret-lokal-yang-kuat
```

Pull image untuk seluruh service:

```powershell
docker compose pull
```

Jalankan seluruh service:

```powershell
docker compose up -d
```

Compose menjalankan `app`, `mongodb`, dan `os`. Periksa statusnya:

```powershell
docker compose ps
```

Buka aplikasi melalui:

```text
http://localhost:5000
```

Buat data awal:

```powershell
docker compose exec app npm run data
```

## Memperbarui App Saja

Untuk mengganti image `app` tanpa menghentikan service `mongodb` dan `os`,
ubah nilai `APP_VERSION` di `.env`, lalu jalankan perintah berikut:

```powershell
docker compose stop app
docker compose rm -f app
docker compose pull app
docker compose create app
docker compose start app
```

Nilai `APP_VERSION` pada `.env` menentukan versi image `app` yang digunakan
oleh Docker Compose. Periksa status service setelah pembaruan:

```powershell
docker compose ps
```

## Push ke Main dan Membuat Tag

Setelah perubahan selesai dan sudah diuji, jalankan dari root repository:

```powershell
git switch main
git add .
git commit -m "Update documentation"
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

Ganti `v1.0.0` dengan nomor versi yang sesuai. Pastikan branch aktif adalah
`main`. Tag dengan format `vMAJOR.MINOR.PATCH` digunakan untuk menandai versi
rilis.

## CI/CD

Workflow [ci-cd.yml](.github/workflows/ci-cd.yml) berjalan saat ada pull request
ke `main`, push ke `main`, atau push tag dengan format `v*.*.*`.

Tahapan CI/CD:

- Memvalidasi file workflow menggunakan `actionlint`.
- Menginstal dependency, menjalankan test frontend dan backend, serta build
  frontend.
- Memeriksa konfigurasi Docker Compose dan build Docker image.
- Saat terjadi push, login ke Docker Hub menggunakan GitHub Secrets, lalu
  build dan publish image MediCore.
- Memberi tag image berdasarkan branch dan tanggal, serta versi semantik dari
  tag Git.

Image MediCore berisi backend Express, dependency backend, frontend React
production, dan Node.js runtime. MongoDB, data database, network, volume, dan
secret runtime tidak disimpan di dalam image.

## Kredensial Data Awal

Script [createAdmin.js](backend/createAdmin.js) membuat akun admin awal.
Password dokter dibuat oleh [createDoctors.js](backend/createDoctors.js).
Periksa isi kedua file tersebut untuk kredensial yang digunakan pada versi
image atau source code yang sedang dijalankan.

## Fitur Utama

### Pasien

- Melihat dashboard, appointment, resep, dokter, dan jadwal tersedia.
- Mencari dokter berdasarkan nama atau spesialisasi.
- Membuat, melihat, dan membatalkan appointment.
- Mengelola profile pasien.

### Dokter

- Melihat dan mengelola appointment serta jadwal praktik.
- Mengelola profile dokter.
- Melihat pasien.
- Membuat, mengubah, dan menghapus resep.

### Admin

- Melihat ringkasan kondisi rumah sakit.
- Mengelola akun dokter dan admin.
- Mengelola status pasien.

## Struktur Project

```text
.
├── backend/                  # REST API, model, route, dan seed data
├── frontend/                 # Source code dan build React
├── Dockerfile                # Multi-stage build frontend dan backend
├── docker-compose.yml        # Definisi service Docker
├── .env.example              # Template environment tanpa secret produksi
└── .github/workflows/        # Workflow CI dan publish image
```

## Port

| Port | Fungsi |
|---|---|
| `5000` | Frontend production dan REST API MediCore |
| `27017` | MongoDB |
