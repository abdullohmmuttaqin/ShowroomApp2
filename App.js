import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import semua halaman
import DashboardScreen from "./screens/DashboardScreen";
import StokScreen from "./screens/StokScreen";
import PenjualanScreen from "./screens/PenjualanScreen";
import LaporanScreen from "./screens/LaporanScreen";
import PiutangScreen from "./screens/PiutangScreen";
import LoginScreen from "./screens/LoginScreen";
import { TAB_ACCESS, logout } from "./utils/auth";
import { supabase } from "./utils/supabase";

function MainApp({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const insets = useSafeAreaInsets();
  const tabsUntukRole = TAB_ACCESS[user.role] || [];

  // Penjaga: kalau activeTab ternyata bukan tab yang diizinkan untuk role ini,
  // otomatis kembalikan ke Dashboard. Ini nutup semua "jalan pintas" yang mungkin
  // ada sekarang atau nanti (misal tombol baru yang lupa dicek role-nya).
  useEffect(() => {
    if (!tabsUntukRole.includes(activeTab)) {
      setActiveTab("Dashboard");
    }
  }, [activeTab]);

  // Fungsi untuk menentukan halaman mana yang ditampilkan
  const renderScreen = () => {
    if (activeTab === "Dashboard")
      return (
        <DashboardScreen
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          user={user}
        />
      );
    if (activeTab === "Stok") return <StokScreen />;
    if (activeTab === "Penjualan") return <PenjualanScreen />;
    if (activeTab === "Laporan") return <LaporanScreen />;
    if (activeTab === "Piutang") return <PiutangScreen />;
  };

  return (
    <View style={styles.container}>
      {/* Area konten halaman */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Tab bar bawah */}
      <View
        style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}
      >
        {tabsUntukRole.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab)}
          >
            <MaterialCommunityIcons
              name={
                tab === "Dashboard"
                  ? "view-dashboard-outline"
                  : tab === "Stok"
                    ? "car-outline"
                    : tab === "Penjualan"
                      ? "cash-register"
                      : "file-document-outline"
              }
              size={22}
              color={activeTab === tab ? "#2563eb" : "#888"}
            />
            <Text
              style={
                activeTab === tab ? styles.tabLabelAktif : styles.tabLabelNormal
              }
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tombol logout kecil, pojok kanan atas */}
      <TouchableOpacity
        style={[styles.logoutButton, { top: insets.top + 10 }]}
        onPress={onLogout}
      >
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabLabelAktif: {
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 10,
  },
  tabLabelNormal: {
    color: "#888",
    fontSize: 10,
  },
  logoutButton: {
    position: "absolute",
    right: 16,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default function App() {
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const cekSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, email")
          .eq("id", data.session.user.id)
          .single();

        if (profile) {
          setUser({
            id: data.session.user.id,
            email: profile.email,
            role: profile.role,
          });
        }
      }

      setIsCheckingSession(false);
    };

    cekSession();
  }, []);

  if (isCheckingSession) {
    return (
      <SafeAreaProvider>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text>Memuat...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <LoginScreen onLoginSuccess={setUser} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <MainApp
        user={user}
        onLogout={async () => {
          await logout();
          setUser(null);
        }}
      />
    </SafeAreaProvider>
  );
}
