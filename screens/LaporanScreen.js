import { View, Text, StyleSheet, ScrollView } from 'react-native';

// Data dummy laporan bulanan
const dataLaporan = [
    { bulan: 'Januari 2026', pemasukan: 550000000, pengeluaran: 280000000 },
    { bulan: 'Februari 2026', pemasukan: 320000000, pengeluaran: 150000000 },
    { bulan: 'Maret 2026', pemasukan: 410000000, pengeluaran: 210000000 },
    { bulan: 'April 2026', pemasukan: 680000000, pengeluaran: 390000000 },
    { bulan: 'Mei 2026', pemasukan: 490000000, pengeluaran: 220000000 },
];

// Fungsi format Rupiah
const formatRupiah = (angka) => {
    return 'Rp ' + angka.toLocaleString('id-ID');
};

export default function LaporanScreen() {
    // Hitung total keseluruhan
    const totalPemasukan = dataLaporan.reduce((total, d) => total + d.pemasukan, 0);
    const totalPengeluaran = dataLaporan.reduce((total, d) => total + d.pengeluaran, 0);

    // Keuntungan = pemasukan - pengeluaran
    const totalKeuntungan = totalPemasukan - totalPengeluaran;

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerJudul}>Laporan Keuangan</Text>
                <Text style={styles.headerSub}>Rekap keseluruhan showroom</Text>
            </View>

            {/* Kartu ringkasan */}
            <View style={styles.kartuWrapper}>
                {/* Pemasukan */}
                <View style={[styles.kartu, styles.kartuHijau]}>
                    <Text style={styles.kartuLabel}>Total Pemasukan</Text>
                    <Text style={styles.kartuNilai}>{formatRupiah(totalPemasukan)}</Text>
                </View>

                {/* Pengeluaran */}
                <View style={[styles.kartu, styles.kartuMerah]}>
                    <Text style={styles.kartuLabel}>Total Pengeluaran</Text>
                    <Text style={styles.kartuNilai}>{formatRupiah(totalPengeluaran)}</Text>
                </View>
            </View>

            {/* Kartu keuntungan */}
            <View style={styles.kartuKeuntungan}>
                <Text style={styles.keuntunganLabel}>Total Keuntungan Bersih</Text>
                <Text style={styles.keuntunganNilai}>{formatRupiah(totalKeuntungan)}</Text>
            </View>

            {/* Tabel rekap bulanan */}
            <View style={styles.tabelWrapper}>
                <Text style={styles.tabelJudul}>Rekap Per Bulan</Text>

                {/* Header tabel */}
                <View style={styles.tabelHeader}>
                    <Text style={[styles.tabelHeaderTeks, { flex: 2 }]}>Bulan</Text>
                    <Text style={[styles.tabelHeaderTeks, { flex: 2 }]}>Pemasukan</Text>
                    <Text style={[styles.tabelHeaderTeks, { flex: 2 }]}>Pengeluaran</Text>
                    <Text style={[styles.tabelHeaderTeks, { flex: 1.5 }]}>Untung</Text>
                </View>

                {/* Baris data */}
                {dataLaporan.map((d, index) => (
                    <View
                        key={index}
                        style={[styles.tabelBaris, index % 2 === 0 && styles.tabelBarisBg]}
                    >
                        <Text style={[styles.tabelTeks, { flex: 2 }]}>{d.bulan}</Text>
                        <Text style={[styles.tabelTeks, styles.teksHijau, { flex: 2 }]}>
                            {formatRupiah(d.pemasukan)}
                        </Text>
                        <Text style={[styles.tabelTeks, styles.teksMerah, { flex: 2 }]}>
                            {formatRupiah(d.pengeluaran)}
                        </Text>
                        <Text style={[styles.tabelTeks, styles.teksBiru, { flex: 1.5 }]}>
                            {formatRupiah(d.pemasukan - d.pengeluaran)}
                        </Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { backgroundColor: '#2563eb', padding: 24, paddingTop: 48 },
    headerJudul: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    headerSub: { fontSize: 14, color: '#bfdbfe', marginTop: 4 },
    kartuWrapper: { flexDirection: 'row', padding: 16, gap: 12 },
    kartu: { flex: 1, borderRadius: 12, padding: 16 },
    kartuHijau: { backgroundColor: '#dcfce7' },
    kartuMerah: { backgroundColor: '#fee2e2' },
    kartuLabel: { fontSize: 11, color: '#555' },
    kartuNilai: { fontSize: 13, fontWeight: 'bold', marginTop: 4 },
    kartuKeuntungan: {
        backgroundColor: '#2563eb', marginHorizontal: 16,
        borderRadius: 12, padding: 16, marginBottom: 16
    },
    keuntunganLabel: { fontSize: 13, color: '#bfdbfe' },
    keuntunganNilai: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 4 },
    tabelWrapper: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16 },
    tabelJudul: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    tabelHeader: {
        flexDirection: 'row', backgroundColor: '#f5f5f5',
        borderRadius: 8, padding: 10, marginBottom: 4
    },
    tabelHeaderTeks: { fontSize: 11, fontWeight: 'bold', color: '#555' },
    tabelBaris: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 4 },
    tabelBarisBg: { backgroundColor: '#fafafa' },
    tabelTeks: { fontSize: 11, color: '#333' },
    teksHijau: { color: '#16a34a' },
    teksMerah: { color: '#dc2626' },
    teksBiru: { color: '#2563eb', fontWeight: 'bold' },
});