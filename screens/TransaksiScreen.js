import { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, TextInput, Modal, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'transaksi_showroom';

const dataAwal = [
    { id: 1, jenis: 'jual', mobil: 'Toyota Avanza', harga: 180000000, tanggal: '01 Jun 2026' },
    { id: 2, jenis: 'beli', mobil: 'Honda Jazz', harga: 150000000, tanggal: '30 Mei 2026' },
    { id: 3, jenis: 'jual', mobil: 'Suzuki Ertiga', harga: 160000000, tanggal: '29 Mei 2026' },
    { id: 4, jenis: 'beli', mobil: 'Daihatsu Xenia', harga: 130000000, tanggal: '28 Mei 2026' },
    { id: 5, jenis: 'jual', mobil: 'Mitsubishi Xpander', harga: 210000000, tanggal: '27 Mei 2026' },
];

const formatRupiah = (angka) => {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
};

export default function TransaksiScreen() {
    const [transaksi, setTransaksi] = useState([]);
    const [filterAktif, setFilterAktif] = useState('Semua');
    const [modalVisible, setModalVisible] = useState(false);
    const [formMobil, setFormMobil] = useState('');
    const [formHarga, setFormHarga] = useState('');
    const [formJenis, setFormJenis] = useState('jual');

    useEffect(() => {
        bacaData();
    }, []);

    const bacaData = async () => {
        try {
            const dataTersimpan = await AsyncStorage.getItem(STORAGE_KEY);
            if (dataTersimpan !== null) {
                setTransaksi(JSON.parse(dataTersimpan));
            } else {
                setTransaksi(dataAwal);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataAwal));
            }
        } catch (e) {
            console.log('Error baca data:', e);
        }
    };

    const simpanData = async (dataBaru) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataBaru));
        } catch (e) {
            console.log('Error simpan data:', e);
        }
    };

    // Fungsi hapus transaksi — tampilkan konfirmasi dulu sebelum hapus
    const hapusTransaksi = (id) => {
        Alert.alert(
            'Hapus Transaksi',
            'Yakin ingin menghapus transaksi ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        const dataBaru = transaksi.filter((t) => t.id !== id);
                        setTransaksi(dataBaru);
                        await simpanData(dataBaru);
                    },
                },
            ]
        );
    };

    const transaksiFiltered = transaksi.filter((t) => {
        if (filterAktif === 'Semua') return true;
        return t.jenis === filterAktif;
    });

    const tambahTransaksi = async () => {
        if (!formMobil || !formHarga) return;

        // Validasi harga maksimal 10 miliar
        if (parseInt(formHarga) > 10000000000) {
            Alert.alert('Harga terlalu besar', 'Maksimal harga adalah Rp 10.000.000.000');
            return;
        }

        const baru = {
            id: Date.now(),
            jenis: formJenis,
            mobil: formMobil,
            harga: parseInt(formHarga),
            tanggal: new Date().toLocaleDateString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric'
            }),
        };

        const dataBaru = [baru, ...transaksi];
        setTransaksi(dataBaru);
        await simpanData(dataBaru);

        setFormMobil('');
        setFormHarga('');
        setFormJenis('jual');
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerJudul}>Transaksi</Text>
                <Text style={styles.headerSub}>{transaksi.length} transaksi tercatat</Text>
            </View>

            {/* Tombol filter */}
            <View style={styles.filterWrapper}>
                {['Semua', 'jual', 'beli'].map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={filterAktif === f ? styles.filterAktif : styles.filterNormal}
                        onPress={() => setFilterAktif(f)}
                    >
                        <Text style={filterAktif === f ? styles.filterTeksAktif : styles.filterTeksNormal}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List transaksi */}
            <ScrollView style={styles.list}>
                {transaksiFiltered.map((t) => (
                    <View key={t.id} style={styles.kartu}>
                        <View style={styles.kartuKiri}>
                            <Text style={styles.namaMobil}>{t.mobil}</Text>
                            <Text style={styles.tanggal}>{t.tanggal}</Text>
                        </View>
                        <View style={styles.kartuKanan}>
                            <Text style={styles.harga}>{formatRupiah(t.harga)}</Text>
                            <View style={t.jenis === 'jual' ? styles.badgeHijau : styles.badgeMerah}>
                                <Text style={styles.badgeTeks}>
                                    {t.jenis === 'jual' ? 'Jual' : 'Beli'}
                                </Text>
                            </View>
                            {/* Tombol hapus */}
                            <TouchableOpacity
                                style={styles.tombolHapus}
                                onPress={() => hapusTransaksi(t.id)}
                            >
                                <Text style={styles.tombolHapusTeks}>Hapus</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Tombol tambah transaksi */}
            <TouchableOpacity
                style={styles.tombolTambah}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.tombolTambahTeks}>+ Tambah Transaksi</Text>
            </TouchableOpacity>

            {/* Modal form tambah transaksi */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalKonten}>
                        <Text style={styles.modalJudul}>Tambah Transaksi</Text>

                        <Text style={styles.inputLabel}>Nama Mobil</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: Toyota Avanza"
                            value={formMobil}
                            onChangeText={setFormMobil}
                        />

                        <Text style={styles.inputLabel}>Harga (Rp)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: 180000000"
                            value={formHarga}
                            onChangeText={setFormHarga}
                            keyboardType="numeric"
                        />

                        <Text style={styles.inputLabel}>Jenis Transaksi</Text>
                        <View style={styles.jenisWrapper}>
                            <TouchableOpacity
                                style={formJenis === 'jual' ? styles.jenisAktif : styles.jenisNormal}
                                onPress={() => setFormJenis('jual')}
                            >
                                <Text style={formJenis === 'jual' ? styles.jenisTeksAktif : styles.jenisTeksNormal}>Jual</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={formJenis === 'beli' ? styles.jenisAktif : styles.jenisNormal}
                                onPress={() => setFormJenis('beli')}
                            >
                                <Text style={formJenis === 'beli' ? styles.jenisTeksAktif : styles.jenisTeksNormal}>Beli</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalTombol}>
                            <TouchableOpacity
                                style={styles.tombolBatal}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.tombolBatalTeks}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.tombolSimpan}
                                onPress={tambahTransaksi}
                            >
                                <Text style={styles.tombolSimpanTeks}>Simpan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { backgroundColor: '#2563eb', padding: 24, paddingTop: 48 },
    headerJudul: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    headerSub: { fontSize: 14, color: '#bfdbfe', marginTop: 4 },
    filterWrapper: { flexDirection: 'row', padding: 16, gap: 8, backgroundColor: '#fff' },
    filterAktif: { backgroundColor: '#2563eb', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
    filterNormal: { backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
    filterTeksAktif: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    filterTeksNormal: { color: '#555', fontSize: 13 },
    list: { flex: 1, padding: 16 },
    kartu: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    kartuKiri: { flex: 1 },
    kartuKanan: { alignItems: 'flex-end' },
    namaMobil: { fontSize: 15, fontWeight: 'bold' },
    tanggal: { fontSize: 12, color: '#888', marginTop: 2 },
    harga: { fontSize: 13, fontWeight: '600', color: '#2563eb', marginBottom: 4 },
    badgeHijau: { backgroundColor: '#dcfce7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
    badgeMerah: { backgroundColor: '#fee2e2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
    badgeTeks: { fontSize: 11, fontWeight: '600' },
    tombolHapus: {
        marginTop: 6,
        backgroundColor: '#fee2e2',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    tombolHapusTeks: { fontSize: 11, color: '#dc2626', fontWeight: '600' },
    tombolTambah: { backgroundColor: '#2563eb', margin: 16, borderRadius: 12, padding: 16, alignItems: 'center' },
    tombolTambahTeks: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalKonten: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
    modalJudul: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    inputLabel: { fontSize: 13, color: '#555', marginBottom: 6, marginTop: 12 },
    input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 14 },
    jenisWrapper: { flexDirection: 'row', gap: 12, marginTop: 4 },
    jenisAktif: { flex: 1, backgroundColor: '#2563eb', borderRadius: 8, padding: 12, alignItems: 'center' },
    jenisNormal: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, alignItems: 'center' },
    jenisTeksAktif: { color: '#fff', fontWeight: 'bold' },
    jenisTeksNormal: { color: '#555' },
    modalTombol: { flexDirection: 'row', gap: 12, marginTop: 24 },
    tombolBatal: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 14, alignItems: 'center' },
    tombolBatalTeks: { color: '#555', fontWeight: 'bold' },
    tombolSimpan: { flex: 1, backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center' },
    tombolSimpanTeks: { color: '#fff', fontWeight: 'bold' },
});