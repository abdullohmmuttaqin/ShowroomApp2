import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Import semua halaman
import DashboardScreen from './screens/DashboardScreen';
import StokScreen from './screens/StokScreen';
import PenjualanScreen from './screens/PenjualanScreen';
import LaporanScreen from './screens/LaporanScreen';
import PiutangScreen from './screens/PiutangScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Fungsi untuk menentukan halaman mana yang ditampilkan
  const renderScreen = () => {
    if (activeTab === 'Dashboard')
      return <DashboardScreen setActiveTab={setActiveTab} />;
    if (activeTab === 'Stok') return <StokScreen />;
    if (activeTab === 'Penjualan') return <PenjualanScreen />;
    if (activeTab === 'Laporan') return <LaporanScreen />;
    if (activeTab === 'Piutang') return <PiutangScreen />;
  };

  return (
    <View style={styles.container}>
      {/* Area konten halaman */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Tab bar bawah */}
      <View style={styles.tabBar}>
        {['Dashboard', 'Stok', 'Penjualan', 'Laporan'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={activeTab === tab ? styles.tabAktif : styles.tabNormal}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingBottom: 50,
    paddingTop: 10,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabAktif: { color: '#2563eb', fontWeight: 'bold', fontSize: 12 },
  tabNormal: { color: '#888', fontSize: 12 },
});