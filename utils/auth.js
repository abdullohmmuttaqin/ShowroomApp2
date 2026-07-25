import { supabase } from "./supabase";

// Login menggunakan Supabase Auth (email + password)
// Mengembalikan { user: {...} } kalau berhasil, atau { error: 'pesan' } kalau gagal
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Setelah login berhasil, ambil role dari tabel profiles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    return { error: "Gagal mengambil data role pengguna." };
  }

  return {
    user: {
      id: data.user.id,
      email: profile.email,
      role: profile.role,
    },
  };
}

export async function logout() {
  await supabase.auth.signOut();
}

// Daftar tab yang boleh diakses tiap role
export const TAB_ACCESS = {
  Owner: ["Dashboard", "Stok", "Penjualan", "Laporan", "Piutang"],
  Admin: ["Dashboard", "Stok", "Penjualan", "Laporan", "Piutang"],
  Sales: ["Dashboard", "Stok", "Penjualan"],
};
