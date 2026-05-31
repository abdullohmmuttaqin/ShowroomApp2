import { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, TextInput, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key untuk AsyncStorage
const STORAGE_KEY = 'stok_showroom';

// Data dummy stok awal
const dataAwal = [
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
    const [stok, setStok] = useState([]);
    const [cari, setCari] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    // State form tambah stok
    const [formMerk, setFormMerk] = useState('');
    const [formTipe, setFormTipe] = useState('');
    const [formTahun, setFormTahun] = useState('');
    const [formHarga, setFormHarga] = useState('');

    // Baca data saat halaman pertama kali dibuka
    useEffect(() => {
        bacaData();
    }, []);

    // Fungsi baca data dari AsyncStorage
    const bacaData = async () => {
        try {
            const dataTersimpan = await AsyncStorage.getItem(STORAGE_KEY);
            if (dataTersimpan !== null) {
                setStok(JSON.parse(dataTersimpan));
            } else {
                setStok(dataAwal);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataAwal));
            }
        } catch (e) {
            console.log('Error baca data:', e);
        }
    };

    // Fungsi simpan data ke AsyncStorage
    const simpanData = async (dataBaru) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataBaru));
        } catch (e) {
            console.log('Error simpan data:', e);
        }
    };

    // Filter stok berdasarkan pencarian
    const stokFiltered = stok.filter(
        (mobil) =>
            mobil.merk.toLowerCase().includes(cari.toLowerCase()) ||
            mobil.tipe.toLowerCase().includes(cari.toLowerCase())
    );

    // Fungsi tambah stok baru
    const tambahStok = async () => {
        if (!formMerk || !formTipe || !formTahun || !formHarga) return;

        const baru = {
            id: Date.now(),
            merk: formMerk,
            tipe: formTipe,
            tahun: parseInt(formTahun),
            harga: parseInt(formHarga),
            status: 'tersedia',
        };

        const dataBaru = [...stok, baru];
        setStok(dataBaru);
        await simpanData(dataBaru);

        // Reset form dan tutup modal
        setFormMerk('');
        setFormTipe('');
        setFormTahun('');
        setFormHarga('');
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerJudul}>Stok Mobil</Text>
                <Text style={styles.headerSub}>{stok.length} unit terdaftar</Text>
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
                        <View style={mobil.status === 'tersedia' ? styles.badgeHijau : styles.badgeMerah}>
                            <Text style={styles.badgeTeks}>{mobil.status}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Tombol tambah stok */}
            <TouchableOpacity
                style={styles.tombolTambah}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.tombolTambahTeks}>+ Tambah Stok</Text>
            </TouchableOpacity>

            {/* Modal form tambah stok */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalKonten}>
                        <Text style={styles.modalJudul}>Tambah Stok Mobil</Text>

                        <Text style={styles.inputLabel}>Merk</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: Toyota"
                            value={formMerk}
                            onChangeText={setFormMerk}
                        />

                        <Text style={styles.inputLabel}>Tipe</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: Avanza"
                            value={formTipe}
                            onChangeText={setFormTipe}
                        />

                        <Text style={styles.inputLabel}>Tahun</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: 2022"
                            value={formTahun}
                            onChangeText={setFormTahun}
                            keyboardType="numeric"
                        />

                        <Text style={styles.inputLabel}>Harga (Rp)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: 180000000"
                            value={formHarga}
                            onChangeText={setFormHarga}
                            keyboardType="numeric"
                        />

                        <View style={styles.modalTombol}>
                            <TouchableOpacity
                                style={styles.tombolBatal}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.tombolBatalTeks}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.tombolSimpan}
                                onPress={tambahStok}
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
    searchWrapper: { padding: 16, backgroundColor: '#fff' },
    searchInput: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, fontSize: 14 },
    list: { flex: 1, padding: 16 },
    kartu: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    kartuKiri: { flex: 1 },
    namaMobil: { fontSize: 15, fontWeight: 'bold' },
    tahun: { fontSize: 12, color: '#888', marginTop: 2 },
    harga: { fontSize: 13, fontWeight: '600', color: '#2563eb', marginTop: 4 },
    badgeHijau: { backgroundColor: '#dcfce7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    badgeMerah: { backgroundColor: '#fee2e2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    badgeTeks: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    tombolTambah: { backgroundColor: '#2563eb', margin: 16, borderRadius: 12, padding: 16, alignItems: 'center' },
    tombolTambahTeks: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalKonten: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
    modalJudul: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    inputLabel: { fontSize: 13, color: '#555', marginBottom: 6, marginTop: 12 },
    input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 14 },
    modalTombol: { flexDirection: 'row', gap: 12, marginTop: 24 },
    tombolBatal: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 14, alignItems: 'center' },
    tombolBatalTeks: { color: '#555', fontWeight: 'bold' },
    tombolSimpan: { flex: 1, backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center' },
    tombolSimpanTeks: { color: '#fff', fontWeight: 'bold' },
});