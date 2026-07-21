import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key AsyncStorage — harus sama persis dengan yang di TransaksiScreen dan StokScreen
const KEY_TRANSAKSI = 'transaksi_showroom';
const KEY_STOK = 'stok_showroom';

// Fungsi format Rupiah
const formatRupiah = (angka) => {
    return 'Rp ' + angka.toLocaleString('id-ID');
};

export default function HomeScreen() {
    const [transaksi, setTransaksi] = useState([]);
    const [stok, setStok] = useState([]);

    // Baca data setiap kali halaman Home dibuka
    useEffect(() => {
        bacaData();
    }, []);

    // Fungsi baca data transaksi dan stok dari AsyncStorage
    const bacaData = async () => {
        try {
            const dataTransaksi = await AsyncStorage.getItem(KEY_TRANSAKSI);
            const dataStok = await AsyncStorage.getItem(KEY_STOK);

            if (dataTransaksi !== null) setTransaksi(JSON.parse(dataTransaksi));
            if (dataStok !== null) setStok(JSON.parse(dataStok));
        } catch (e) {
            console.log('Error baca data:', e);
        }
    };

    // Hitung total pemasukan dari transaksi jual
    const totalPemasukan = transaksi
        .filter((t) => t.jenis === 'jual')
        .reduce((total, t) => total + t.harga, 0);

    // Hitung total pengeluaran dari transaksi beli
    const totalPengeluaran = transaksi
        .filter((t) => t.jenis === 'beli')
        .reduce((total, t) => total + t.harga, 0);

    // Hitung jumlah stok yang masih tersedia
    const stokTersedia = stok.filter((m) => m.status === 'tersedia').length;

    // Ambil 5 transaksi terakhir untuk ditampilkan
    const transaksiTerakhir = transaksi.slice(0, 5);

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerJudul}>Dashboard</Text>
                <Text style={styles.headerSub}>Showroom Mobil</Text>
            </View>

            {/* Kartu ringkasan */}
            <View style={styles.kartuWrapper}>
                {/* Kartu pemasukan */}
                <View style={[styles.kartu, styles.kartuHijau]}>
                    <Text style={styles.kartuLabel}>Pemasukan</Text>
                    <Text style={styles.kartuNilai}>{formatRupiah(totalPemasukan)}</Text>
                </View>

                {/* Kartu pengeluaran */}
                <View style={[styles.kartu, styles.kartuMerah]}>
                    <Text style={styles.kartuLabel}>Pengeluaran</Text>
                    <Text style={styles.kartuNilai}>{formatRupiah(totalPengeluaran)}</Text>
                </View>
            </View>

            {/* Kartu stok tersedia */}
            <View style={styles.kartuStok}>
                <Text style={styles.stokLabel}>Stok Tersedia</Text>
                <Text style={styles.stokNilai}>{stokTersedia} unit</Text>
            </View>

            {/* Transaksi terakhir */}
            <View style={styles.seksi}>
                <Text style={styles.seksiJudul}>Transaksi Terakhir</Text>
                {transaksiTerakhir.length === 0 ? (
                    <Text style={styles.kosong}>Belum ada transaksi</Text>
                ) : (
                    transaksiTerakhir.map((t) => (
                        <View key={t.id} style={styles.itemTransaksi}>
                            <View>
                                <Text style={styles.namaMobil}>{t.mobil}</Text>
                                <Text style={t.jenis === 'jual' ? styles.labelJual : styles.labelBeli}>
                                    {t.jenis === 'jual' ? '● Jual' : '● Beli'}
                                </Text>
                            </View>
                            <Text style={styles.harga}>{formatRupiah(t.harga)}</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2563eb',
        padding: 24,
        paddingTop: 48,
    },
    headerJudul: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSub: {
        fontSize: 14,
        color: '#bfdbfe',
        marginTop: 4,
    },
    kartuWrapper: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    kartu: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
    },
    kartuHijau: {
        backgroundColor: '#dcfce7',
    },
    kartuMerah: {
        backgroundColor: '#fee2e2',
    },
    kartuLabel: {
        fontSize: 12,
        color: '#555',
    },
    kartuNilai: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 4,
    },
    kartuStok: {
        backgroundColor: '#eff6ff',
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 16,
        marginBottom: 4,
    },
    stokLabel: {
        fontSize: 12,
        color: '#555',
    },
    stokNilai: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2563eb',
        marginTop: 4,
    },
    seksi: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 12,
        padding: 16,
    },
    seksiJudul: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    itemTransaksi: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    namaMobil: {
        fontSize: 14,
        fontWeight: '500',
    },
    labelJual: {
        fontSize: 12,
        color: '#16a34a',
        marginTop: 2,
    },
    labelBeli: {
        fontSize: 12,
        color: '#dc2626',
        marginTop: 2,
    },
    harga: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#333',
    },
    kosong: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
        paddingVertical: 12,
    },
});