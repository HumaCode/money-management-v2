# 🚀 Panduan Hosting / Deployment ke 1Panel VPS (FrankenPHP)

Domain Target: `https://cuan.humacode.my.id`

---

## 📌 1. Analisis Port 1Panel (Pencegahan Bentrok)

Berdasarkan port Docker yang sedang aktif di 1Panel Anda:
- **Port Web yang Digunakan**: `8088`, `8089`, `8080`, `8000`, `8081`, `3000`, `8787`, `2019`, `5173`.
- **Port MySQL yang Digunakan**: `3306`, `3307`, `3308`.

### ✅ Port Bebas & Aman yang Dipilih:
- **FrankenPHP App Port**: `8095` (`127.0.0.1:8095 -> 8080/tcp`)
- **MySQL Container Port**: `3309` (`127.0.0.1:3309 -> 3306/tcp`)

---

## 🛠️ 2. File Konfigurasi Docker yang Dibuat

Project ini sudah dilengkapi 3 file konfigurasi Docker siap pakai:
1. **`docker-compose.yml`** (Konfigurasi Service App FrankenPHP + MySQL 8.0)
2. **`Dockerfile`** (Base image `dunglas/frankenphp:latest-php8.2-alpine` dengan ekstensi Laravel pdo_mysql, gd, bcmath, dll.)
3. **`Caddyfile`** (Server config ultra-fast untuk FrankenPHP)

---

## 📋 3. Langkah-Langkah Deploy di 1Panel

### Langkah A: Upload / Git Clone Project ke VPS
1. Masuk ke **1Panel** → Menu **Container** → **Compose** (atau via SSH).
2. Clone repository project ini ke folder di VPS, misal: `/opt/1panel/apps/money-management-v2`.

### Langkah B: Jalankan Docker Compose di 1Panel
1. Masuk ke **1Panel** → **Container** → **Compose** → Klik **Create Compose**.
2. Beri nama: `money-management`
3. Pilih path ke folder project, atau copy-paste isi file `docker-compose.yml`.
4. Klik **Build & Start / OK**.
5. Tunggu proses build FrankenPHP selesai hingga kontainer `cuan_money_app` dan `cuan_money_db` berstatus **Running**.

---

### Langkah C: Setup Initial Laravel (Pertama Kali Deploy)
Jalankan perintah ini di dalam kontainer `cuan_money_app` via **1Panel Terminal / SSH**:

```bash
# 1. Masuk ke kontainer aplikasi
docker exec -it cuan_money_app sh

# 2. Install composer dependencies (jika belum di-build di vendor)
composer install --no-dev --optimize-autoloader

# 3. Generate APP_KEY (jika belum)
php artisan key:generate --force

# 4. Storage Link (agar foto struk & avatar bisa diakses publik)
php artisan storage:link

# 5. Jalankan Migration & Seeder Database
php artisan migrate:fresh --seed --force

# 6. Optimize Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

exit
```

---

## 🌐 4. Setting Reverse Proxy di 1Panel (SSL HTTPS)

Agar domain `https://cuan.humacode.my.id` bisa dibuka publik dengan HTTPS:

1. Masuk ke **1Panel** → Menu **OpenResty / Website** → Klik **Create Website** (atau Proxy).
2. **Primary Domain**: `cuan.humacode.my.id`
3. **Proxy Type**: `Reverse Proxy`
4. **Proxy Target (Local IP & Port)**: `http://127.0.0.1:8095`
5. **HTTPS / SSL**:
   - Aktifkan SSL (Let's Encrypt / Certbot di 1Panel) untuk domain `cuan.humacode.my.id`.
6. Klik **Save / Confirm**.

---

🎉 **Selesai!** Aplikasi Anda kini berjalan dengan **FrankenPHP Ultra-Fast Engine** di domain `https://cuan.humacode.my.id` tanpa ada port yang bentrok di 1Panel!
