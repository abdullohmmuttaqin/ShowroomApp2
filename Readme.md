# AutoShowroom — Aplikasi Pembukuan Showroom Mobil

Aplikasi mobile pembukuan showroom mobil berbasis **React Native & Expo**, dibangun untuk mempermudah pengelolaan stok kendaraan, pencatatan transaksi jual/beli, dan pelaporan keuangan showroom secara real-time.

---

## Screenshot

> Login | Dashboard | Stok | Penjualan | Laporan | Piutang

---

## Fitur

- **Autentikasi** — Login multi-role (Owner, Admin, Sales) via Supabase Auth dengan pembatasan akses tab sesuai role
- **Dashboard** — Ringkasan total omset, stok, terjual, piutang, aktivitas terbaru, dan menu cepat secara real-time
- **Stok Mobil** — CRUD stok kendaraan, pencarian berdasarkan merk/tipe/nopol, upload foto, harga modal & harga jual terpisah, ubah status tersedia/terjual
- **Penjualan** — CRUD transaksi penjualan, sistem DP & pelunasan, cetak kwitansi PDF, filter status
- **Laporan Keuangan** — Rekap pemasukan, pengeluaran, dan keuntungan bersih per bulan dari data Supabase
- **Piutang** — CRUD piutang pelanggan, proses pembayaran, riwayat pembayaran

---

## Tech Stack

| Teknologi    | Versi    | Fungsi                      |
| ------------ | -------- | --------------------------- |
| React Native | 0.81.5   | Framework utama mobile      |
| Expo         | SDK 54   | Toolchain & development     |
| Supabase     | ~2.x     | Database cloud & Auth       |
| JavaScript   | ES2021   | Bahasa pemrograman          |

---

## Struktur Folder

```
ShowroomApp2/
├── screens/
│   ├── LoginScreen.js       # Halaman login
│   ├── DashboardScreen.js   # Dashboard utama
│   ├── StokScreen.js        # Manajemen stok mobil
│   ├── PenjualanScreen.js   # Manajemen penjualan
│   ├── LaporanScreen.js     # Laporan keuangan
│   └── PiutangScreen.js     # Manajemen piutang
├── utils/
│   ├── supabase.js          # Konfigurasi Supabase client
│   ├── auth.js              # Helper autentikasi
│   └── theme.js             # Tema warna aplikasi
├── assets/                  # Gambar dan aset
├── App.js                   # Entry point & navigasi tab bar
├── app.json                 # Konfigurasi Expo
├── eas.json                 # Konfigurasi EAS Build
└── package.json             # Dependensi project
```

---

## Cara Menjalankan

### Prasyarat

- Node.js v18 ke atas
- npm
- Expo Go di HP Android
- Akun Supabase (untuk environment variables)

### Langkah

1. **Clone repository**

```bash
git clone https://github.com/abdullohmmuttaqin/ShowroomApp2.git
cd ShowroomApp2
```

1. **Install dependensi**

```bash
npm install
```

1. **Buat file .env di root project**

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

1. **Jalankan server**

```bash
npx expo start
```

1. **Buka di HP**
   - Scan QR code menggunakan aplikasi **Expo Go**
   - Pastikan HP dan laptop terhubung ke jaringan yang sama

---

## Build APK

Project ini sudah dikonfigurasi dengan EAS Build.

```bash
eas build --platform android --profile preview
```

---

## Roadmap Pengembangan

### Fase 1 — Foundation (Selesai)

- [x] Setup project React Native + Expo
- [x] Navigasi tab bar
- [x] CRUD stok mobil
- [x] CRUD transaksi penjualan
- [x] Laporan keuangan bulanan

### Fase 2 — Core Features (Selesai)

- [x] Autentikasi pengguna (Login/Logout)
- [x] Multi role pengguna (Owner, Admin, Sales)
- [x] Sistem DP & pelunasan di Penjualan
- [x] Cetak kwitansi PDF
- [x] Pencarian kendaraan berdasarkan nopol
- [x] Upload foto kendaraan
- [x] Integrasi Supabase (database cloud & auth)
- [x] Modul piutang lengkap
- [x] Laporan keuangan dari data real Supabase
- [x] Build APK Android via EAS Build

### Fase 3 — Advanced Features (Belum)

- [ ] Notifikasi pajak jatuh tempo
- [ ] Laporan laba rugi otomatis
- [ ] Versi web (React Native Web)

---

## Developer

- **Abdullah Muhammad Muttaqim** — [@abdullohmmuttaqin](https://github.com/abdullohmmuttaqin)
- **Ain Murphys** — [@ainmurphys](https://github.com/ainmurphys)

---

## Lisensi

Project ini dibuat untuk keperluan internal showroom. All rights reserved.
