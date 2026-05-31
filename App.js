import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Import semua halaman
import HomeScreen from './screens/HomeScreen';
import TransaksiScreen from './screens/TransaksiScreen';
import StokScreen from './screens/StokScreen';
import LaporanScreen from './screens/LaporanScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');

  // Fungsi untuk menentukan halaman mana yang ditampilkan
  const renderScreen = () => {
    if (activeTab === 'Home') return <HomeScreen />;
    if (activeTab === 'Transaksi') return <TransaksiScreen />;
    if (activeTab === 'Stok') return <StokScreen />;
    if (activeTab === 'Laporan') return <LaporanScreen />;
  };

  return (
    <View style={styles.container}>
      {/* Area konten halaman */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Tab bar bawah */}
      <View style={styles.tabBar}>
        {['Home', 'Transaksi', 'Stok', 'Laporan'].map((tab) => (
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