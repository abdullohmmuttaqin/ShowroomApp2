import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../utils/supabase";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TAB_ACCESS } from "../utils/auth";

const STORAGE_KEY_AKTIVITAS = "aktivitas_showroom";

// Fungsi format angka jadi Rupiah penuh
const formatRupiah = (angka) => {
  return "Rp " + angka.toLocaleString("id-ID");
};

// Fungsi format angka jadi singkatan (T, M, Jt)
const formatSingkat = (angka) => {
  if (angka >= 1000000000000) {
    return "Rp " + (angka / 1000000000000).toFixed(1).replace(".", ",") + " T";
  }
  if (angka >= 1000000000) {
    return "Rp " + (angka / 1000000000).toFixed(1).replace(".", ",") + " M";
  }
  if (angka >= 1000000) {
    return "Rp " + (angka / 1000000).toFixed(1).replace(".", ",") + " Jt";
  }
  return formatRupiah(angka);
};

export default function DashboardScreen({ setActiveTab, activeTab, user }) {
  const [totalStok, setTotalStok] = useState(0);
  const [totalTerjual, setTotalTerjual] = useState(0);
  const [totalOmset, setTotalOmset] = useState(0);
  const [totalPiutang, setTotalPiutang] = useState(0);
  const [nilaiPiutang, setNilaiPiutang] = useState(0);
  const [aktivitas, setAktivitas] = useState([]);

  // Refresh data setiap kali tab Dashboard aktif
  useEffect(() => {
    if (activeTab === "Dashboard") {
      loadDashboardData();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      const [stokRes, penjualanRes, piutangRes, aktivitasData] =
        await Promise.all([
          supabase.from("stok_mobil").select("id"),
          supabase.from("penjualan").select("harga"),
          supabase.from("piutang").select("sisa"),
          AsyncStorage.getItem(STORAGE_KEY_AKTIVITAS),
        ]);

      if (stokRes.error) throw stokRes.error;
      if (penjualanRes.error) throw penjualanRes.error;
      if (piutangRes.error) throw piutangRes.error;

      setTotalStok(stokRes.data.length);

      setTotalTerjual(penjualanRes.data.length);
      setTotalOmset(
        penjualanRes.data.reduce((total, item) => total + item.harga, 0),
      );

      setTotalPiutang(piutangRes.data.length);
      setNilaiPiutang(
        piutangRes.data.reduce(
          (total, item) => total + Number(item.sisa || 0),
          0,
        ),
      );

      if (aktivitasData) {
        setAktivitas(JSON.parse(aktivitasData).slice(0, 5));
      }
    } catch (error) {
      console.log("Error dashboard:", error.message);
    }
  };

  // Data menu cepat (semua opsi)
  const semuaMenuCepat = [
    {
      label: "Penjualan",
      icon: "cash-register",
      tab: "Penjualan",
      warna: "#2563eb",
    },
    {
      label: "Piutang",
      icon: "account-credit-card",
      tab: "Piutang",
      warna: "#7c3aed",
    },
  ];

  // Filter menu cepat, hanya tampilkan tab yang diizinkan untuk role user
  const tabsUntukRole = TAB_ACCESS[user.role] || [];
  const menuCepat = semuaMenuCepat.filter((menu) =>
    tabsUntukRole.includes(menu.tab),
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerJudul}>Dashboard</Text>
        <Text style={styles.headerSub}>Selamat datang di ShowroomApp</Text>
      </View>

      {/* Hero Omset */}
      <View style={styles.omsetCard}>
        <Text style={styles.omsetLabel}>Total Omset</Text>
        <Text style={styles.omsetValue}>{formatRupiah(totalOmset)}</Text>
        <Text style={styles.omsetSub}>
          dari {totalTerjual} transaksi penjualan
        </Text>
      </View>

      {/* Statistik 2x2 */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="car" size={20} color="#2563eb" />
          <Text style={styles.statAngka}>{totalStok}</Text>
          <Text style={styles.statLabel}>Total Stok</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons name="cash" size={20} color="#16a34a" />
          <Text style={styles.statAngka}>{totalTerjual}</Text>
          <Text style={styles.statLabel}>Terjual</Text>
        </View>

        {tabsUntukRole.includes("Piutang") && (
          <>
            <View style={styles.statCard}>
              <MaterialCommunityIcons
                name="account-clock"
                size={20}
                color="#f59e0b"
              />
              <Text style={styles.statAngka}>{totalPiutang}</Text>
              <Text style={styles.statLabel}>Piutang</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialCommunityIcons
                name="currency-usd"
                size={20}
                color="#dc2626"
              />
              <Text style={styles.statAngka}>
                {formatSingkat(nilaiPiutang)}
              </Text>
              <Text style={styles.statLabel}>Nilai Piutang</Text>
            </View>
          </>
        )}
      </View>

      {/* Menu Cepat */}
      <Text style={styles.seksiJudul}>Menu Cepat</Text>
      <View style={styles.menuGrid}>
        {menuCepat.map((menu) => (
          <TouchableOpacity
            key={menu.tab}
            style={styles.menuCard}
            onPress={() => setActiveTab(menu.tab)}
          >
            <View
              style={[styles.menuIcon, { backgroundColor: menu.warna + "15" }]}
            >
              <MaterialCommunityIcons
                name={menu.icon}
                size={24}
                color={menu.warna}
              />
            </View>
            <Text style={styles.menuLabel}>{menu.label}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color="#9ca3af"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Aktivitas Terbaru */}
      <Text style={styles.seksiJudul}>Aktivitas Terbaru</Text>
      <View style={styles.aktivitasCard}>
        {aktivitas.length === 0 ? (
          <Text style={styles.kosong}>Belum ada aktivitas</Text>
        ) : (
          aktivitas.map((item) => (
            <View key={item.id} style={styles.aktivitasItem}>
              <View style={styles.aktivitasDot} />
              <Text style={styles.aktivitasTeks}>{item.teks}</Text>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerJudul: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSub: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  omsetCard: {
    backgroundColor: "#2563eb",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  omsetLabel: {
    color: "#bfdbfe",
    fontSize: 13,
  },
  omsetValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 4,
  },
  omsetSub: {
    color: "#93c5fd",
    fontSize: 12,
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    margin: 4,
  },
  statAngka: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  seksiJudul: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
  },
  menuGrid: {
    paddingHorizontal: 20,
    gap: 8,
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  aktivitasCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
  },
  aktivitasItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  aktivitasDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
    marginTop: 5,
  },
  aktivitasTeks: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
  },
  kosong: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 8,
  },
});
