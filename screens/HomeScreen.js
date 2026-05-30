import { View, Text, StyleSheet, ScrollView } from 'react-native';

// Data dummy transaksi — nanti akan diganti dengan data dari database
const dummyTransaksi = [
    { id: 1, jenis: 'jual', mobil: 'Toyota Avanza', harga: 180000000 },
    { id: 2, jenis: 'beli', mobil: 'Honda Jazz', harga: 150000000 },
    { id: 3, jenis: 'jual', mobil: 'Suzuki Ertiga', harga: 160000000 },
    { id: 4, jenis: 'beli', mobil: 'Daihatsu Xenia', harga: 130000000 },
    { id: 5, jenis: 'jual', mobil: 'Mitsubishi Xpander', harga: 210000000 },
];

// Fungsi untuk format angka jadi format Rupiah
const formatRupiah = (angka) => {
    return 'Rp ' + angka.toLocaleString('id-ID');
};

export default function HomeScreen() {
    // Hitung total pemasukan (transaksi jual)
    const totalPemasukan = dummyTransaksi
        .filter((t) => t.jenis === 'jual')
        .reduce((total, t) => total + t.harga, 0);

    // Hitung total pengeluaran (transaksi beli)
    const totalPengeluaran = dummyTransaksi
        .filter((t) => t.jenis === 'beli')
        .reduce((total, t) => total + t.harga, 0);

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

            {/* Transaksi terakhir */}
            <View style={styles.seksi}>
                <Text style={styles.seksiJudul}>Transaksi Terakhir</Text>
                {dummyTransaksi.map((t) => (
                    <View key={t.id} style={styles.itemTransaksi}>
                        <View>
                            <Text style={styles.namaMobil}>{t.mobil}</Text>
                            <Text style={t.jenis === 'jual' ? styles.labelJual : styles.labelBeli}>
                                {t.jenis === 'jual' ? '● Jual' : '● Beli'}
                            </Text>
                        </View>
                        <Text style={styles.harga}>{formatRupiah(t.harga)}</Text>
                    </View>
                ))}
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
});