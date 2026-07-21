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
const STORAGE_KEY_AKTIVITAS =
    'aktivitas_showroom';

const formatSingkat = (angka) => {

    if (angka >= 1000000000000) {
        return (
            'Rp ' +
            (angka / 1000000000000)
                .toFixed(1)
                .replace('.', ',') +
            ' T'
        );
    }

    if (angka >= 1000000000) {
        return (
            'Rp ' +
            (angka / 1000000000)
                .toFixed(1)
                .replace('.', ',') +
            ' M'
        );
    }

    return formatRupiah(angka);
};

export default function DashboardScreen({
    setActiveTab,
    activeTab,
}) {

    const [totalStok, setTotalStok] = useState(0);
    const [totalTerjual, setTotalTerjual] = useState(0);
    const [totalOmset, setTotalOmset] = useState(0);
    const [totalPiutang, setTotalPiutang] = useState(0);
    const [nilaiPiutang, setNilaiPiutang] = useState(0);
    const [aktivitas, setAktivitas] = useState([]);

    useEffect(() => {
        if (activeTab === 'Dashboard') {
            loadDashboardData();
        }
    }, [activeTab]);

    const loadAktivitas = async () => {
        try {

            const aktivitasData =
                await AsyncStorage.getItem(
                    STORAGE_KEY_AKTIVITAS
                );

            if (aktivitasData) {

                const aktivitas =
                    JSON.parse(aktivitasData);

                setAktivitas(
                    aktivitas.slice(0, 5)
                );
            }

        } catch (error) {

            console.log(
                'Error load aktivitas:',
                error
            );
        }
    };

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
            }

            if (piutangData) {

                const piutang =
                    JSON.parse(piutangData);

                setTotalPiutang(piutang.length);

                console.log(
                    'DATA PIUTANG DASHBOARD:',
                    piutang
                );

                const totalNilaiPiutang =
                    piutang.reduce(
                        (total, item) =>
                            total + Number(item.sisa || 0),
                        0
                    );

                console.log(
                    'TOTAL NILAI PIUTANG PRABOWO + JOKOWI:',
                    totalNilaiPiutang
                );
                setNilaiPiutang(totalNilaiPiutang);
            }

            await loadAktivitas();

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

            {/* Hero Omset */}
            <View style={styles.omsetCard}>

                <Text style={styles.omsetLabel}>
                    Total Omset
                </Text>

                <Text style={styles.omsetValue}>
                    {formatRupiah(totalOmset)}
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
                        {formatSingkat(
                            nilaiPiutang
                        )}
                    </Text>

                    <Text style={styles.cardLabel}>
                        Nilai Piutang
                    </Text>
                </View>


            </View>

            {/* Aktivitas Terbaru */}
            <Text style={styles.sectionTitle}>
                Aktivitas Terbaru
            </Text>

            <View style={styles.activityCard}>

                {aktivitas.length === 0 ? (
                    <Text style={styles.activityItem}>
                        Belum ada aktivitas
                    </Text>
                ) : (
                    aktivitas.map((item) => (
                        <Text
                            key={item.id}
                            style={styles.activityItem}
                        >
                            • {item.teks}
                        </Text>
                    ))
                )}

            </View>

            {/* Shortcut Menu */}
            <Text style={styles.sectionTitle}>
                Menu Cepat
            </Text>

            <View style={styles.menuContainer}>

                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setActiveTab('Penjualan')}
                >
                    <Text>Transaksi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setActiveTab('Piutang')}
                >
                    <Text>Piutang</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuButton}
                    disabled={true}
                >
                    <Text>Kas & Bank (Segera)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuButton}
                    disabled={true}
                >
                    <Text>Pengaturan (Segera)</Text>
                </TouchableOpacity>

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

    omsetCard: {
        backgroundColor: '#2563eb',
        borderRadius: 16,
        padding: 20,
        marginTop: 5,
        marginBottom: 10,
    },

    omsetLabel: {
        color: '#bfdbfe',
        fontSize: 14,
    },

    omsetValue: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 6,
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