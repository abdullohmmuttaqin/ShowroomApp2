import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';

const STORAGE_KEY_STOK = 'stok_showroom';
const STORAGE_KEY_PENJUALAN = 'penjualan_showroom';
const STORAGE_KEY_PIUTANG = 'piutang_showroom';
const formatRupiah = (angka) => {
    return 'Rp ' + angka.toLocaleString('id-ID');
};

export default function DashboardScreen({ setActiveTab }) {

    const [totalStok, setTotalStok] = useState(0);
    const [totalTerjual, setTotalTerjual] = useState(0);
    const [totalOmset, setTotalOmset] = useState(0);
    const [totalPiutang, setTotalPiutang] = useState(0);
    const [aktivitas, setAktivitas] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {

            const stokData =
                await AsyncStorage.getItem(STORAGE_KEY_STOK);

            const penjualanData =
                await AsyncStorage.getItem(STORAGE_KEY_PENJUALAN);

            const piutangData =
                await AsyncStorage.getItem(STORAGE_KEY_PIUTANG);

            if (stokData) {
                const stok = JSON.parse(stokData);

                setTotalStok(stok.length);
            }

            if (penjualanData) {
                const penjualan = JSON.parse(penjualanData);

                setTotalTerjual(penjualan.length);

                const omset = penjualan.reduce(
                    (total, item) => total + item.harga,
                    0
                );

                setTotalOmset(omset);

                setAktivitas(
                    penjualan.slice(0, 3)
                );
            }

            if (piutangData) {

                const piutang =
                    JSON.parse(piutangData);

                setTotalPiutang(piutang.length);
            }

        } catch (error) {
            console.log('Error dashboard:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>

            {/* Header */}
            <View style={styles.headerContainer}>
                <Text style={styles.title}>
                    Dashboard
                </Text>

                <Text style={styles.subtitle}>
                    Selamat Datang di ShowroomApp
                </Text>
            </View>

            {/* Statistik */}
            <View style={styles.statsContainer}>

                <View style={styles.card}>
                    <Text style={styles.cardNumber}>
                        {totalStok}
                    </Text>
                    <Text style={styles.cardLabel}>
                        Total Stok
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardNumber}>
                        {totalTerjual}
                    </Text>

                    <Text style={styles.cardLabel}>
                        Terjual
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardNumber}>
                        {totalPiutang}
                    </Text>
                    <Text style={styles.cardLabel}>Piutang</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardNumber}>
                        {formatRupiah(totalOmset)}
                    </Text>

                    <Text style={styles.cardLabel}>
                        Total Omset
                    </Text>
                </View>

            </View>

            {/* Shortcut Menu */}
            <Text style={styles.sectionTitle}>
                Menu Cepat
            </Text>

            <View style={styles.menuContainer}>

                <TouchableOpacity style={styles.menuButton}>
                    <Text>Transaksi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setActiveTab('Piutang')}
                >
                    <Text>Piutang</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton}>
                    <Text>Kas & Bank</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton}>
                    <Text>Pengaturan</Text>
                </TouchableOpacity>

            </View>

            {/* Aktivitas Terbaru */}
            <Text style={styles.sectionTitle}>
                Aktivitas Terbaru
            </Text>

            <View style={styles.activityCard}>

                {aktivitas.map((item) => (
                    <Text
                        key={item.id}
                        style={styles.activityItem}
                    >
                        • {item.mobil} terjual
                    </Text>
                ))}

            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f7fb',
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },

    headerContainer: {
        marginTop: 50,
        marginBottom: 20,
    },

    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },

    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    card: {
        width: '48%',
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
    },

    cardNumber: {
        fontSize: 14,
        fontWeight: 'bold',
    },

    cardLabel: {
        marginTop: 5,
        color: '#666',
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },

    menuContainer: {
        gap: 10,
    },

    menuButton: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 12,
    },

    activityCard: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 12,
        marginTop: 10,
    },

    activityItem: {
        marginBottom: 10,
        color: '#444',
    },
});