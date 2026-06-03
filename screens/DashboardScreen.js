import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_STOK = 'stok_showroom';
const STORAGE_KEY_PENJUALAN = 'penjualan_showroom';

export default function DashboardScreen() {

    const [totalStok, setTotalStok] = useState(0);
    const [totalTerjual, setTotalTerjual] = useState(0);
    const [totalOmset, setTotalOmset] = useState(0);
    const [aktivitas, setAktivitas] = useState([]);

    useEffect(() => {
        bacaDataStok();
        bacaDataPenjualan();
    }, []);

    const bacaDataStok = async () => {
        try {
            const dataTersimpan = await AsyncStorage.getItem(STORAGE_KEY_STOK);

            if (dataTersimpan) {
                const dataStok = JSON.parse(dataTersimpan);

                setTotalStok(dataStok.length);

                setTotalTerjual(
                    dataStok.filter(
                        mobil => mobil.status === 'terjual'
                    ).length
                );
            }
        } catch (error) {
            console.log('Error baca stok:', error);
        }
    };

    const bacaDataPenjualan = async () => {
        try {
            const dataTersimpan = await AsyncStorage.getItem(
                STORAGE_KEY_PENJUALAN
            );

            if (dataTersimpan) {
                const dataPenjualan = JSON.parse(dataTersimpan);

                const omset = dataPenjualan.reduce(
                    (total, item) => total + item.harga,
                    0
                );

                setTotalOmset(omset);

                setAktivitas(dataPenjualan.slice(0, 3));
            }
        } catch (error) {
            console.log('Error baca penjualan:', error);
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
                    Selamat Datang di Showroom
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
                    <Text style={styles.cardNumber}>3</Text>
                    <Text style={styles.cardLabel}>Piutang</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardNumber}>120JT</Text>
                    <Text style={styles.cardLabel}>Kas</Text>
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

                <TouchableOpacity style={styles.menuButton}>
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
                <Text style={styles.activityItem}>
                    • Toyota Avanza terjual
                </Text>

                <Text style={styles.activityItem}>
                    • Honda Jazz masuk stok
                </Text>

                <Text style={styles.activityItem}>
                    • Pembayaran Rp 50.000.000 diterima
                </Text>
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
        fontSize: 20,
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