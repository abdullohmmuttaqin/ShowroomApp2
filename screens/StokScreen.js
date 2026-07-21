import { tambahAktivitas } from '../utils/aktivitas';
import { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, TextInput, Modal, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'stok_showroom';

const dataAwal = [
    { id: 1, merk: 'Toyota', tipe: 'Avanza', tahun: 2021, harga: 180000000, status: 'tersedia' },
    { id: 2, merk: 'Honda', tipe: 'Jazz', tahun: 2020, harga: 150000000, status: 'terjual' },
    { id: 3, merk: 'Suzuki', tipe: 'Ertiga', tahun: 2022, harga: 160000000, status: 'tersedia' },
    { id: 4, merk: 'Daihatsu', tipe: 'Xenia', tahun: 2021, harga: 130000000, status: 'tersedia' },
    { id: 5, merk: 'Mitsubishi', tipe: 'Xpander', tahun: 2022, harga: 210000000, status: 'terjual' },
    { id: 6, merk: 'Toyota', tipe: 'Fortuner', tahun: 2021, harga: 450000000, status: 'tersedia' },
];

const formatRupiah = (angka) => {
    return 'Rp ' + angka.toLocaleString('id-ID');
};

export default function StokScreen() {
    const [stok, setStok] = useState([]);
    const [cari, setCari] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [formMerk, setFormMerk] = useState('');
    const [formTipe, setFormTipe] = useState('');
    const [formTahun, setFormTahun] = useState('');
    const [formHarga, setFormHarga] = useState('');

    // Menyimpan ID mobil yang sedang diedit
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        bacaData();
    }, []);

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

    const simpanData = async (dataBaru) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataBaru));
        } catch (e) {
            console.log('Error simpan data:', e);
        }
    };

    // Fungsi ubah status mobil — tersedia jadi terjual atau sebaliknya
    const ubahStatus = async (id) => {
        const dataBaru = stok.map((mobil) => {
            if (mobil.id === id) {
                return {
                    ...mobil,
                    status: mobil.status === 'tersedia' ? 'terjual' : 'tersedia',
                };
            }
            return mobil;
        });
        setStok(dataBaru);
        await simpanData(dataBaru);
    };

    // Fungsi hapus stok — tampilkan konfirmasi dulu
    const hapusStok = (id) => {

        const mobil = stok.find(
            item => item.id === id
        );

        Alert.alert(
            'Hapus Stok',
            'Yakin ingin menghapus mobil ini dari stok?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {

                        const dataBaru = stok.filter(
                            item => item.id !== id
                        );

                        setStok(dataBaru);

                        await simpanData(dataBaru);

                        await tambahAktivitas(
                            `🗑️ ${mobil.merk} ${mobil.tipe} dihapus dari stok`
                        );
                    },
                },
            ]
        );
    };

    const stokFiltered = stok.filter(
        (mobil) =>
            mobil.merk.toLowerCase().includes(cari.toLowerCase()) ||
            mobil.tipe.toLowerCase().includes(cari.toLowerCase())
    );

    const editStok = (mobil) => {
        setFormMerk(mobil.merk);
        setFormTipe(mobil.tipe);
        setFormTahun(mobil.tahun.toString());
        setFormHarga(mobil.harga.toString());

        setEditId(mobil.id);

        setModalVisible(true);
    };

    const tambahStok = async () => {

        if (
            !formMerk ||
            !formTipe ||
            !formTahun ||
            !formHarga
        ) {
            return;
        }

        let dataBaru = [];

        if (editId !== null) {

            dataBaru = stok.map((mobil) =>
                mobil.id === editId
                    ? {
                        ...mobil,
                        merk: formMerk,
                        tipe: formTipe,
                        tahun: parseInt(formTahun),
                        harga: parseInt(formHarga),
                    }
                    : mobil
            );

            setStok(dataBaru);
            await simpanData(dataBaru);

            await tambahAktivitas(
                `✏️ ${formMerk} ${formTipe} diperbarui`
            );

        } else {

            const baru = {
                id: Date.now(),
                merk: formMerk,
                tipe: formTipe,
                tahun: parseInt(formTahun),
                harga: parseInt(formHarga),
                status: 'tersedia',
            };

            dataBaru = [...stok, baru];

            setStok(dataBaru);
            await simpanData(dataBaru);

            await tambahAktivitas(
                `🚗 ${formMerk} ${formTipe} ditambahkan ke stok`
            );
        }

        setFormMerk('');
        setFormTipe('');
        setFormTahun('');
        setFormHarga('');

        setEditId(null);

        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerJudul}>Stok Mobil</Text>
                <Text style={styles.headerSub}>{stok.length} unit terdaftar</Text>
            </View>

            {/* Ringkasan Statistik */}
            <View style={styles.statistikContainer}>

                <View style={styles.statistikCard}>
                    <Text style={styles.statistikAngka}>
                        {stok.length}
                    </Text>
                    <Text style={styles.statistikLabel}>
                        Total
                    </Text>
                </View>

                <View style={styles.statistikCard}>
                    <Text style={styles.statistikAngka}>
                        {stok.filter(mobil => mobil.status === 'tersedia').length}
                    </Text>
                    <Text style={styles.statistikLabel}>
                        Tersedia
                    </Text>
                </View>

                <View style={styles.statistikCard}>
                    <Text style={styles.statistikAngka}>
                        {stok.filter(mobil => mobil.status === 'terjual').length}
                    </Text>
                    <Text style={styles.statistikLabel}>
                        Terjual
                    </Text>
                </View>

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

                            {/* Tombol ubah status dan hapus */}
                            <View style={styles.tombolWrapper}>
                                <TouchableOpacity
                                    style={mobil.status === 'tersedia' ? styles.tombolTerjual : styles.tombolTersedia}
                                    onPress={() => ubahStatus(mobil.id)}
                                >
                                    <Text style={styles.tombolStatusTeks}>
                                        {mobil.status === 'tersedia' ? 'Tandai Terjual' : 'Tandai Tersedia'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.tombolEdit}
                                    onPress={() => editStok(mobil)}
                                >
                                    <Text style={styles.tombolEditTeks}>
                                        Edit
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.tombolHapus}
                                    onPress={() => hapusStok(mobil.id)}
                                >
                                    <Text style={styles.tombolHapusTeks}>Hapus</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Badge status */}
                        <View style={mobil.status === 'tersedia' ? styles.badgeHijau : styles.badgeMerah}>
                            <Text style={styles.badgeTeks}>{mobil.status}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Tombol tambah stok */}
            <TouchableOpacity
                style={styles.tombolTambah}
                onPress={() => {

                    setEditId(null);

                    setFormMerk('');
                    setFormTipe('');
                    setFormTahun('');
                    setFormHarga('');

                    setModalVisible(true);
                }}
            >
                <Text style={styles.tombolTambahTeks}>+ Tambah Stok</Text>
            </TouchableOpacity>

            {/* Modal form tambah stok */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalKonten}>
                        <Text style={styles.modalJudul}>
                            {editId !== null
                                ? 'Edit Stok Mobil'
                                : 'Tambah Stok Mobil'}
                        </Text>

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
                                onPress={() => {

                                    setFormMerk('');
                                    setFormTipe('');
                                    setFormTahun('');
                                    setFormHarga('');

                                    setEditId(null);

                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.tombolBatalTeks}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.tombolSimpan}
                                onPress={tambahStok}
                            >
                                <Text style={styles.tombolSimpanTeks}>
                                    {editId !== null
                                        ? 'Update'
                                        : 'Simpan'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
    },
    searchInput: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,

        borderWidth: 1,
        borderColor: '#e5e7eb',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,

        elevation: 1,
    },
    list: {
        flex: 1,
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
    tombolWrapper: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    tombolTerjual: {
        backgroundColor: '#fee2e2',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    tombolTersedia: {
        backgroundColor: '#dcfce7',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    tombolStatusTeks: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
    },
    tombolHapus: {
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    tombolHapusTeks: {
        fontSize: 11,
        fontWeight: '600',
        color: '#dc2626',
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
    tombolTambah: {
        backgroundColor: '#2563eb',
        margin: 16,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    tombolTambahTeks: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalKonten: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
    },
    modalJudul: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        color: '#555',
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    modalTombol: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    tombolBatal: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    tombolBatalTeks: {
        color: '#555',
        fontWeight: 'bold',
    },
    tombolSimpan: {
        flex: 1,
        backgroundColor: '#2563eb',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    tombolSimpanTeks: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statistikContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },

    statistikCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        marginHorizontal: 4,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,

        elevation: 2,
    },

    statistikAngka: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2563eb',
    },

    statistikLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },

    tombolEdit: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
    },

    tombolEditTeks: {
        color: '#fff',
        fontWeight: '600',
    },
});