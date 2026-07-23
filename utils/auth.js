// Data user untuk 3 role: Owner, Admin, Sales
// Catatan: ini masih data lokal (belum ada backend/database),
// nanti diganti waktu integrasi Supabase di Fase 3
export const USERS = [
  { username: "owner", password: "owner123", role: "Owner" },
  { username: "admin", password: "admin123", role: "Admin" },
  { username: "sales", password: "sales123", role: "Sales" },
];

// Cek username & password, kembalikan data user kalau cocok, null kalau gagal
export function login(username, password) {
  const user = USERS.find(
    (u) => u.username === username.trim() && u.password === password,
  );
  return user || null;
}

// Daftar tab yang boleh diakses tiap role
export const TAB_ACCESS = {
  Owner: ["Dashboard", "Stok", "Penjualan", "Laporan", "Piutang"],
  Admin: ["Dashboard", "Stok", "Penjualan", "Laporan", "Piutang"],
  Sales: ["Dashboard", "Stok", "Penjualan"],
};
