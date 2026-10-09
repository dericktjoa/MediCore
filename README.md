<h1>MediCore Hospital Management System</h1>

<p>MediCore adalah aplikasi manajemen rumah sakit berbasis MERN yang menyediakan
autentikasi admin, dokter, dan pasien; pengaturan jadwal dokter; appointment;
prescription; serta dashboard administrasi.</p>

<h2>Struktur Project</h2>

<ul>
  <li><code>backend</code> - API Node.js dan Express.</li>
  <li><code>frontend</code> - aplikasi React.</li>
  <li>MongoDB - database lokal yang diakses melalui backend.</li>
</ul>

<h2>Prasyarat</h2>

Install aplikasi berikut sebelum menjalankan project:

<ul>
  <li>Node.js LTS dan npm.</li>
  <li>MongoDB Community Server untuk Windows.</li>
  <li>Git, jika repository diambil menggunakan Git.</li>
  <li>MongoDB Compass (opsional) untuk melihat isi database.</li>
</ul>

<p>Frontend tidak terhubung langsung ke MongoDB. Alurnya adalah:</p>

<pre><code>Browser → Frontend React → Backend Express → MongoDB</code></pre>

<p>Untuk instalasi lokal, gunakan <code>mongod</code> sebagai server MongoDB.
<code>mongosh</code> hanya diperlukan jika ingin mengakses database melalui
terminal. <code>mongos</code> tidak diperlukan.</p>

<h2>Menjalankan Project dari Repository</h2>

<h3>1. Download atau clone repository</h3>

<p>Dengan Git:</p>

<pre><code>git clone https://github.com/KshithijSinghania/Hospital-Management-System.git
cd Hospital-Management-System</code></pre>

<p>Jika menggunakan file ZIP, ekstrak file tersebut lalu buka terminal di folder
utama project.</p>

<h3>2. Jalankan MongoDB lokal</h3>

<p>Setelah MongoDB Community Server terinstall, buka PowerShell sebagai
Administrator:</p>

<pre><code>Get-Service MongoDB
Start-Service MongoDB
Test-NetConnection 127.0.0.1 -Port 27017</code></pre>

<p>Nilai <code>TcpTestSucceeded</code> harus <code>True</code>. Jika service
MongoDB sudah berstatus <code>Running</code>, perintah
<code>Start-Service MongoDB</code> tidak perlu dijalankan lagi.</p>

<h3>3. Siapkan dan jalankan backend</h3>

<p>Buka terminal pertama dari folder utama project:</p>

<pre><code>cd backend
npm install</code></pre>

<p>Buat file <code>backend/.env</code>. File ini tidak disertakan di repository
karena berisi konfigurasi lokal.</p>

<pre><code>MONGO_URI=mongodb://127.0.0.1:27017/medicore
PORT=5000</code></pre>

<p>Tambahkan data awal admin dan dokter pada database lokal:</p>

<pre><code>npm run data</code></pre>

<p>Perintah tersebut menjalankan <code>createAdmin.js</code> dan
<code>createDoctors.js</code>. Gunakan perintah ini pada database baru. Jika
admin sudah pernah dibuat, perintah dapat berhenti karena email admin duplikat.
Dalam kondisi tersebut, buat dokter dengan:</p>

<pre><code>node createDoctors.js</code></pre>

<p>Jalankan backend dan biarkan terminal ini tetap terbuka:</p>

<pre><code>npm start</code></pre>

<p>Backend tersedia di
<a href="http://localhost:5000" target="_blank" rel="noopener noreferrer">
http://localhost:5000</a>.</p>

<h3>4. Siapkan dan jalankan frontend</h3>

<p>Buka terminal kedua dari folder utama project:</p>

<pre><code>cd frontend
npm install</code></pre>

<p>Buat file <code>frontend/.env</code>:</p>

<pre><code>REACT_APP_API_URL=http://localhost:5000</code></pre>

<p>Jalankan frontend:</p>

<pre><code>npm start</code></pre>

<p>Browser biasanya terbuka otomatis. Jika tidak, buka:
<a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
http://localhost:3000</a>.</p>

<h2>Urutan Singkat Setelah Instalasi</h2>

<p>Pastikan MongoDB berjalan, kemudian gunakan dua terminal:</p>

<pre><code>Terminal 1
cd backend
npm install
npm run data
npm start</code></pre>

<pre><code>Terminal 2
cd frontend
npm install
npm start</code></pre>

<p>Untuk penggunaan berikutnya, <code>npm install</code> dan
<code>npm run data</code> tidak perlu diulang kecuali dependency atau database
belum disiapkan.</p>

<h2>Akun Awal</h2>

<p><code>npm run data</code> membuat akun dokter dari
<code>backend/createDoctors.js</code>. Password default dokter yang digunakan
script tersebut adalah <code>Doctor123!</code>. Segera ubah password pada
lingkungan nyata dan jangan membagikan kredensial default.</p>

<p>Akun admin dibuat oleh <code>backend/createAdmin.js</code>. Periksa file
tersebut sebelum menjalankan script dan ubah data admin sesuai kebutuhan lokal.</p>

<h2>Akses Database Lokal</h2>

<p>Nama database yang digunakan adalah <code>medicore</code>. Jika
<code>mongosh</code> tersedia:</p>

<pre><code>mongosh "mongodb://127.0.0.1:27017/medicore"
show collections
exit</code></pre>

<p>Untuk MongoDB Compass, gunakan connection string:</p>

<pre><code>mongodb://127.0.0.1:27017</code></pre>

<h2>Troubleshooting</h2>

<ul>
  <li><code>ECONNREFUSED 127.0.0.1:27017</code>: jalankan service
  <code>MongoDB</code> dan pastikan port <code>27017</code> terbuka.</li>
  <li>Frontend tidak dapat mengakses API: pastikan backend berjalan di port
  <code>5000</code> dan <code>frontend/.env</code> berisi
  <code>http://localhost:5000</code>.</li>
  <li>Port <code>5000</code> atau <code>3000</code> sedang digunakan: hentikan
  aplikasi lain atau ubah konfigurasi port yang sesuai.</li>
  <li>Data MongoDB Atlas tidak otomatis tersalin ke database lokal. Lakukan
  export/import secara terpisah jika data lama diperlukan.</li>
</ul>

<h2>Keamanan Repository</h2>

<p>File <code>.env</code>, dependency, hasil build, log, dan file database lokal
diabaikan oleh Git melalui <code>.gitignore</code>. Jangan commit password,
JWT secret, atau connection string database yang berisi kredensial.</p>

<h2>Teknologi</h2>

<ul>
  <li>React, React Router, Tailwind CSS, dan Lucide React.</li>
  <li>Node.js, Express, Mongoose, JWT, bcrypt, dan dotenv.</li>
  <li>MongoDB Community Server.</li>
</ul>
