import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import semua halaman yang sudah kita buat
import HomeScreen from './screens/HomeScreen';
import TransaksiScreen from './screens/TransaksiScreen';
import StokScreen from './screens/StokScreen';
import LaporanScreen from './screens/LaporanScreen';

// Membuat objek Tab Navigator
const Tab = createBottomTabNavigator();

// App adalah pintu utama — semua halaman didaftarkan di sini
export default function App() {
  return (
    // NavigationContainer membungkus seluruh navigasi aplikasi
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Transaksi" component={TransaksiScreen} />
        <Tab.Screen name="Stok" component={StokScreen} />
        <Tab.Screen name="Laporan" component={LaporanScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}