# AutoShowroom — Aplikasi Pembukuan Showroom Mobil

Aplikasi mobile pembukuan showroom mobil berbasis **React Native & Expo**, dibangun untuk mempermudah pengelolaan stok kendaraan, pencatatan transaksi jual/beli, dan pelaporan keuangan showroom secara real-time.

---

## Screenshot

> Dashboard | Transaksi | Stok | Laporan

---

## Fitur

- **Dashboard** — Ringkasan pemasukan, pengeluaran, stok tersedia, dan 5 transaksi terakhir secara real-time
- **Transaksi** — Catat transaksi jual/beli, filter berdasarkan jenis, hapus transaksi dengan konfirmasi, validasi input harga
- **Stok Mobil** — Daftar stok kendaraan, pencarian, tambah stok baru, ubah status tersedia/terjual, hapus stok
- **Laporan Keuangan** — Rekap pemasukan, pengeluaran, dan keuntungan bersih per bulan
- **Penyimpanan Lokal** — Data tersimpan permanen di HP menggunakan AsyncStorage

---

## Tech Stack

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React Native | 0.81.5 | Framework utama mobile |
| Expo | SDK 54 | Toolchain & development |
| AsyncStorage | ~1.23.1 | Penyimpanan data lokal |
| JavaScript | ES2021 | Bahasa pemrograman |

---

## Struktur Folder

```
ShowroomApp2/
├── screens/
│   ├── HomeScreen.js        # Dashboard utama
│   ├── TransaksiScreen.js   # Manajemen transaksi
│   ├── StokScreen.js        # Manajemen stok mobil
│   └── LaporanScreen.js     # Laporan keuangan
├── assets/                  # Gambar dan aset
├── App.js                   # Entry point & navigasi tab bar
├── app.json                 # Konfigurasi Expo
└── package.json             # Dependensi project
```

---

## Cara Menjalankan

### Prasyarat

- Node.js v18 ke atas
- npm atau yarn
- Expo Go di HP Android/iOS

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

1. **Jalankan server**

```bash
npx expo start
```

1. **Buka di HP**
   - Scan QR code menggunakan aplikasi **Expo Go**
   - Pastikan HP dan laptop terhubung ke jaringan yang sama

---

## Roadmap Pengembangan

### Fase 1 — Foundation (Selesai)

- [x] Setup project React Native + Expo
- [x] Navigasi tab bar
- [x] Dashboard dengan data real-time
- [x] CRUD transaksi jual/beli
- [x] CRUD stok mobil
- [x] Laporan keuangan bulanan
- [x] Penyimpanan lokal dengan AsyncStorage

### Fase 2 — Core Features (Dalam Pengembangan)

- [ ] Autentikasi pengguna (Login/Logout)
- [ ] Multi role pengguna (Owner, Admin, Sales)
- [ ] Modul penjualan lengkap (DP, pelunasan, kwitansi)
- [ ] Modul piutang
- [ ] Pencarian kendaraan berdasarkan nopol

### Fase 3 — Advanced Features

- [ ] Integrasi Supabase (database cloud)
- [ ] Upload foto kendaraan
- [ ] Notifikasi pajak jatuh tempo
- [ ] Laporan laba rugi otomatis
- [ ] Cetak kwitansi & surat jalan

### Fase 4 — Production

- [ ] Build APK Android
- [ ] Publish ke Play Store
- [ ] Versi web (React Native Web)

---

## 👨‍💻 Developer

**Abd Muttaqin** — [@abdullohmmuttaqin](https://github.com/abdullohmmuttaqin)

---

## Lisensi

Project ini dibuat untuk keperluan internal showroom. All rights reserved.
