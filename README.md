# MediCore

MediCore adalah aplikasi manajemen rumah sakit berbasis web untuk mengelola
pasien, dokter, appointment, jadwal dokter, dan resep obat. Aplikasi memiliki
tiga jenis pengguna: pasien, dokter, dan admin.

## Pilihan Menjalankan Aplikasi

Ada dua cara utama untuk menjalankan MediCore:

1. **Pull image dari Docker Hub** — tidak membutuhkan source code untuk runtime.
2. **Build image dari source code lokal** — digunakan saat mengembangkan atau
   menguji perubahan code.

Pada kedua cara tersebut, frontend React dan backend Express berjalan dalam
satu container aplikasi. MongoDB tetap berjalan sebagai container terpisah.

## Prasyarat

- Docker Desktop atau Docker Engine yang sedang berjalan.
- PowerShell untuk contoh command di bawah.
- Port `5000` dan `27017` tersedia di komputer lokal.

Periksa instalasi Docker:

```powershell
docker version
docker compose version
```

## Cara 1: Build Image dari Source Code Lokal

Gunakan cara ini saat mengembangkan atau menguji perubahan code. Jalankan dari
root repository:

```powershell
git clone https://github.com/dericktjoa/MediCore.git
cd MediCore
```

Dockerfile menggunakan multi-stage build: frontend dibuild terlebih dahulu,
kemudian hasil build frontend dan backend disalin ke image runtime.

```powershell
docker build -t plankboard/medicore:local .
```

Verifikasi image:

```powershell
docker image ls plankboard/medicore
```

## Cara 2: Pull Image dari Docker Hub

Cara ini menjalankan image yang sudah dibuild dan dipublikasikan ke Docker Hub.
Source code backend dan frontend tidak diperlukan untuk runtime. Pull seluruh
image yang digunakan project dalam satu bagian:

```powershell
docker pull plankboard/medicore:1.1.0
docker pull mongo:7
docker pull ubuntu:22.04
```

## Menjalankan dengan Docker Compose

File `docker-compose.yml` mendefinisikan service, network, volume, port, dan
environment variable. Service aplikasi menggunakan `image:`, bukan build dari
source code lokal.

Salin template environment:

```powershell
Copy-Item .env.example .env
```

Isi `.env` dengan tag dan secret yang digunakan:

```text
DOCKERHUB_USERNAME=plankboard
APP_VERSION=1.1.0
JWT_SECRET=ganti-dengan-secret-lokal-yang-kuat
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

## Menjalankan Secara Manual

```powershell
$appImage = "plankboard/medicore:local"
# Untuk image Docker Hub, gunakan:
# $appImage = "plankboard/medicore:1.1.0"
```

Buat resource Docker jika belum ada:

```powershell
docker network create medicore-network
docker volume create mongodb-data
```

Jalankan MongoDB, OS demonstrasi, dan aplikasi:

```powershell
docker run -d `
  --name medicore-mongodb `
  --network medicore-network `
  --network-alias mongodb `
  -p 27017:27017 `
  -v mongodb-data:/data/db `
  mongo:7

docker run -d `
  --name medicore-os `
  --network medicore-network `
  ubuntu:22.04 `
  sleep infinity

docker run -d `
  --name medicore-app `
  --network medicore-network `
  -p 5000:5000 `
  -e MONGO_URI=mongodb://mongodb:27017/medicore `
  -e PORT=5000 `
  -e JWT_SECRET=local-development-secret `
  $appImage
```

Periksa container dan log aplikasi:

```powershell
docker ps
docker logs medicore-app
```

Jalankan data awal:

```powershell
docker exec medicore-app npm run data
```

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

## Arsitektur Container

```text
Browser
   |
   v
medicore-app:5000
   |- React production build
   `- Express REST API
          |
          v
medicore-mongodb:27017
```

Frontend production disajikan oleh Express dari container aplikasi yang sama.
Backend terhubung ke MongoDB melalui hostname Docker `mongodb`, bukan
`localhost`.

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

Port `0` hanya digunakan oleh test backend untuk mendapatkan port sementara
secara otomatis.
