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
import { COLORS, RADIUS } from "../utils/theme";

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerJudul}>Dashboard</Text>
        <Text style={styles.headerSub}>Selamat datang di ShowroomApp</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
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
                style={[
                  styles.menuIcon,
                  { backgroundColor: menu.warna + "15" },
                ]}
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
            aktivitas.map((item, index) => {
              const [ikon, ...sisaKata] = item.teks.split(" ");
              const teksTanpaIkon = sisaKata.join(" ");
              const isTerakhir = index === aktivitas.length - 1;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.aktivitasItem,
                    !isTerakhir && styles.aktivitasItemDivider,
                  ]}
                >
                  <View style={styles.aktivitasIconWrap}>
                    <Text style={styles.aktivitasIkon}>{ikon}</Text>
                  </View>
                  <Text style={styles.aktivitasTeks}>{teksTanpaIkon}</Text>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerJudul: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  omsetCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    borderRadius: RADIUS.card,
    padding: 24,
    marginBottom: 16,
  },
  omsetLabel: {
    color: "#e6fff7",
    fontSize: 13,
  },
  omsetValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 4,
  },
  omsetSub: {
    color: "#e6fff7",
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
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: 16,
    margin: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statAngka: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  seksiJudul: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
  },
  menuGrid: {
    paddingHorizontal: 20,
    gap: 8,
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
    color: COLORS.textPrimary,
  },
  aktivitasCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    borderRadius: RADIUS.card,
    paddingHorizontal: 16,
  },
  aktivitasItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  aktivitasItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  aktivitasIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.tagBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  aktivitasIkon: {
    fontSize: 15,
  },
  aktivitasTeks: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 19,
  },
  kosong: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingVertical: 8,
  },
});
