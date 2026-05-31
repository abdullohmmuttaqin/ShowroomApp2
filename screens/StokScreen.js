import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';

// Data dummy stok mobil — nanti akan diganti dengan data dari database
const dummyStok = [
    { id: 1, merk: 'Toyota', tipe: 'Avanza', tahun: 2021, harga: 180000000, status: 'tersedia' },
    { id: 2, merk: 'Honda', tipe: 'Jazz', tahun: 2020, harga: 150000000, status: 'terjual' },
    { id: 3, merk: 'Suzuki', tipe: 'Ertiga', tahun: 2022, harga: 160000000, status: 'tersedia' },
    { id: 4, merk: 'Daihatsu', tipe: 'Xenia', tahun: 2021, harga: 130000000, status: 'tersedia' },
    { id: 5, merk: 'Mitsubishi', tipe: 'Xpander', tahun: 2022, harga: 210000000, status: 'terjual' },
    { id: 6, merk: 'Toyota', tipe: 'Fortuner', tahun: 2021, harga: 450000000, status: 'tersedia' },
];

// Fungsi format Rupiah
const formatRupiah = (angka) => {
    return 'Rp ' + angka.toLocaleString('id-ID');
};

export default function StokScreen() {
    // State untuk menyimpan teks pencarian
    const [cari, setCari] = useState('');

    // Filter stok berdasarkan pencarian — cek merk dan tipe
    const stokFiltered = dummyStok.filter(
        (mobil) =>
            mobil.merk.toLowerCase().includes(cari.toLowerCase()) ||
            mobil.tipe.toLowerCase().includes(cari.toLowerCase())
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerJudul}>Stok Mobil</Text>
                <Text style={styles.headerSub}>{dummyStok.length} unit terdaftar</Text>
            </View>

            {/* Search bar */}
            <View style={styles.searchWrapper}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Cari merk atau tipe mobil..."
                    value={cari}
                    onChangeText={setCari}
                />
            </View>

            {/* List stok mobil */}
            <ScrollView style={styles.list}>
                {stokFiltered.map((mobil) => (
                    <View key={mobil.id} style={styles.kartu}>
                        <View style={styles.kartuKiri}>
                            <Text style={styles.namaMobil}>{mobil.merk} {mobil.tipe}</Text>
                            <Text style={styles.tahun}>Tahun {mobil.tahun}</Text>
                            <Text style={styles.harga}>{formatRupiah(mobil.harga)}</Text>
                        </View>
                        {/* Badge status tersedia/terjual */}
                        <View style={mobil.status === 'tersedia' ? styles.badgeHijau : styles.badgeMerah}>
                            <Text style={styles.badgeTeks}>{mobil.status}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
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
    searchWrapper: {
        padding: 16,
        backgroundColor: '#fff',
    },
    searchInput: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
    },
    list: {
        padding: 16,
    },
    kartu: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    kartuKiri: {
        flex: 1,
    },
    namaMobil: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    tahun: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    harga: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2563eb',
        marginTop: 4,
    },
    badgeHijau: {
        backgroundColor: '#dcfce7',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeMerah: {
        backgroundColor: '#fee2e2',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeTeks: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
});