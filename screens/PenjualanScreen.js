import { tambahAktivitas } from '../utils/aktivitas';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
} from 'react-native';

const STORAGE_KEY = 'penjualan_showroom';

const dataAwal = [
    {
        id: 1,
        mobil: 'Toyota Avanza',
        harga: 180000000,
        tanggal: '12 Mei 2026',
        status: 'Lunas',
    },
    {
        id: 2,
        mobil: 'Honda Jazz',
        harga: 150000000,
        tanggal: '15 Mei 2026',
        status: 'DP',
    },
];

const formatRupiah = (angka) => {
    return 'Rp ' + angka.toLocaleString('id-ID');
};

export default function PenjualanScreen() {

    const [modalVisible, setModalVisible] = useState(false);
    const [modeEdit, setModeEdit] = useState(false);
    const [idEdit, setIdEdit] = useState(null);
    const [namaMobil, setNamaMobil] = useState('');
    const [hargaJual, setHargaJual] = useState('');
    const [tanggalJual, setTanggalJual] = useState('');
    const [dataPenjualan, setDataPenjualan] = useState(dataAwal);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        bacaDataPenjualan();
    }, []);

    const bacaDataPenjualan = async () => {
        try {
            const dataTersimpan = await AsyncStorage.getItem(STORAGE_KEY);

            if (dataTersimpan !== null) {
                setDataPenjualan(JSON.parse(dataTersimpan));
            } else {
                setDataPenjualan(dataAwal);
                await AsyncStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(dataAwal)
                );
            }
        } catch (error) {
            console.log('Error baca penjualan:', error);
        }
    };

    const simpanDataPenjualan = async (dataBaru) => {
        try {
            await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(dataBaru)
            );
        } catch (error) {
            console.log('Error simpan penjualan:', error);
        }
    };

    const totalOmset = dataPenjualan.reduce(
        (total, item) => total + item.harga,
        0
    );

    const simpanPenjualan = async () => {

        if (!namaMobil || !hargaJual || !tanggalJual) {
            Alert.alert('Peringatan', 'Semua field wajib diisi.');
            return;
        }

        if (!/^\d+$/.test(hargaJual)) {
            Alert.alert('Peringatan', 'Harga jual hanya boleh berisi angka.');
            return;
        }

        const hargaBaru = parseInt(hargaJual, 10);

        if (!Number.isFinite(hargaBaru) || hargaBaru <= 0) {
            Alert.alert('Peringatan', 'Harga jual harus berupa angka lebih dari 0.');
            return;
        }

        let dataBaru = [];

        if (modeEdit) {

            dataBaru = dataPenjualan.map(
                (item) =>
                    item.id === idEdit
                        ? {
                            ...item,
                            mobil: namaMobil,
                            harga: hargaBaru,
                            tanggal: tanggalJual,
                        }
                        : item
            );
            setDataPenjualan(dataBaru);

            await simpanDataPenjualan(dataBaru);

            await tambahAktivitas(
                `✏️ Penjualan ${namaMobil} diperbarui`
            );

        } else {

            const transaksiBaru = {
                id: Date.now(),
                mobil: namaMobil,
                harga: hargaBaru,
                tanggal: tanggalJual,
                status: 'Lunas',
            };

            dataBaru = [
                transaksiBaru,
                ...dataPenjualan,
            ];

            setDataPenjualan(dataBaru);

            await simpanDataPenjualan(dataBaru);

            await tambahAktivitas(
                `💰 ${namaMobil} berhasil terjual`
            );
        }

        setNamaMobil('');
        setHargaJual('');
        setTanggalJual('');

        setModeEdit(false);
        setIdEdit(null);

        setSelectedDate(new Date());

        setModalVisible(false);
    };

    const hapusPenjualan = (id) => {

        Alert.alert(
            'Hapus Penjualan',
            'Yakin ingin menghapus data ini?',
            [
                {
                    text: 'Batal',
                    style: 'cancel',
                },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {

                        const dataBaru =
                            dataPenjualan.filter(
                                (item) => item.id !== id
                            );

                        setDataPenjualan(dataBaru);

                        await simpanDataPenjualan(
                            dataBaru
                        );
                    },
                },
            ]
        );
    };

    const pilihTanggal = (event, date) => {
        setShowDatePicker(false);

        if (!date) {
            return;
        }

        setSelectedDate(date);

        const tanggalFormat = date.toLocaleDateString(
            'id-ID',
            {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }
        );

        setTanggalJual(tanggalFormat);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Penjualan</Text>
                <Text style={styles.subtitle}>
                    Ringkasan transaksi showroom
                </Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero omset */}
                <View style={styles.heroCard}>
                    <Text style={styles.heroTitle}>Omset Bulan Ini</Text>
                    <Text style={styles.heroAmount}>
                        {formatRupiah(totalOmset)}
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        Dari {dataPenjualan.length} transaksi
                    </Text>
                </View>

                {/* Statistik */}
                <View style={styles.statsContainer}>
                    <View style={styles.card}>
                        <Text style={styles.cardNumber}>
                            {dataPenjualan.length}
                        </Text>
                        <Text style={styles.cardLabel}>Unit Terjual</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardNumber}>
                            {formatRupiah(totalOmset)}
                        </Text>
                        <Text style={styles.cardLabel}>Total Omset</Text>
                    </View>
                </View>

                {/* Riwayat penjualan */}
                <Text style={styles.sectionTitle}>Riwayat Penjualan</Text>

                {dataPenjualan.map((item) => (
                    <View key={item.id} style={styles.saleCard}>
                        {/* Baris atas: nama + badge status */}
                        <View style={styles.saleCardHeader}>
                            <Text style={styles.carName}>{item.mobil}</Text>
                            <View style={item.status === 'Lunas' ? styles.badgeLunas : styles.badgeDP}>
                                <Text style={item.status === 'Lunas' ? styles.badgeLunasTeks : styles.badgeDPTeks}>
                                    {item.status}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.price}>{formatRupiah(item.harga)}</Text>
                        <Text style={styles.date}>{item.tanggal}</Text>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Tombol aksi */}
                        <View style={styles.tombolWrapper}>
                            <TouchableOpacity
                                style={styles.btnEdit}
                                onPress={() => {
                                    setModeEdit(true);
                                    setIdEdit(item.id);
                                    setNamaMobil(item.mobil);
                                    setHargaJual(item.harga.toString());
                                    setTanggalJual(item.tanggal);
                                    setModalVisible(true);
                                }}
                            >
                                <Text style={styles.btnEditText}>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.btnHapus}
                                onPress={() => hapusPenjualan(item.id)}
                            >
                                <Text style={styles.btnHapusText}>Hapus</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Tombol tambah */}
            <TouchableOpacity
                style={styles.tombolTambah}
                onPress={() => {
                    setModeEdit(false);
                    setIdEdit(null);
                    setNamaMobil('');
                    setHargaJual('');
                    setTanggalJual('');
                    setSelectedDate(new Date());
                    setModalVisible(true);
                }}
            >
                <Text style={styles.tombolTambahTeks}>+ Tambah Penjualan</Text>
            </TouchableOpacity>

            {/* Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {modeEdit ? 'Edit Penjualan' : 'Tambah Penjualan'}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nama Mobil"
                            value={namaMobil}
                            onChangeText={setNamaMobil}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Harga Jual"
                            value={hargaJual}
                            onChangeText={setHargaJual}
                            keyboardType="numeric"
                        />

                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={{ color: tanggalJual ? '#111827' : '#9ca3af' }}>
                                {tanggalJual || 'Pilih Tanggal'}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={pilihTanggal}
                            />
                        )}

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={styles.btnBatal}
                                onPress={() => {
                                    setModeEdit(false);
                                    setIdEdit(null);
                                    setNamaMobil('');
                                    setHargaJual('');
                                    setTanggalJual('');
                                    setSelectedDate(new Date());
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.btnBatalText}>Batal</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.btnSimpan}
                                onPress={simpanPenjualan}
                            >
                                <Text style={styles.btnSimpanText}>
                                    {modeEdit ? 'Update' : 'Simpan'}
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
        backgroundColor: '#f5f7fb',
    },
    header: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 20,
        paddingTop: 52,
        paddingBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        color: '#bfdbfe',
        marginTop: 4,
        fontSize: 13,
    },
    scrollContent: {
        padding: 16,
    },
    heroCard: {
        backgroundColor: '#2563eb',
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
    },
    heroTitle: {
        color: '#bfdbfe',
        fontSize: 13,
    },
    heroAmount: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 4,
    },
    heroSubtitle: {
        color: '#93c5fd',
        marginTop: 6,
        fontSize: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },
    cardNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    cardLabel: {
        marginTop: 4,
        color: '#6b7280',
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#111827',
    },
    saleCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#7c3aed',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },
    saleCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    carName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111827',
        flex: 1,
    },
    price: {
        color: '#2563eb',
        marginTop: 4,
        fontWeight: '700',
        fontSize: 14,
    },
    date: {
        color: '#6b7280',
        marginTop: 4,
        fontSize: 12,
    },
    badgeLunas: {
        backgroundColor: '#dcfce7',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    badgeLunasTeks: {
        fontSize: 11,
        fontWeight: '600',
        color: '#16a34a',
    },
    badgeDP: {
        backgroundColor: '#fef3c7',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    badgeDPTeks: {
        fontSize: 11,
        fontWeight: '600',
        color: '#d97706',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 12,
    },
    tombolWrapper: {
        flexDirection: 'row',
        gap: 8,
    },
    btnEdit: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    btnEditText: {
        color: '#2563eb',
        fontWeight: '600',
        fontSize: 11,
    },
    btnHapus: {
        backgroundColor: '#fef2f2',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    btnHapusText: {
        color: '#dc2626',
        fontWeight: '600',
        fontSize: 11,
    },
    tombolTambah: {
        backgroundColor: '#2563eb',
        margin: 16,
        borderRadius: 14,
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
    modalContainer: {
        backgroundColor: '#fff',
        padding: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#111827',
    },
    input: {
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        fontSize: 14,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    btnBatal: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnBatalText: {
        color: '#6b7280',
        fontWeight: '600',
    },
    btnSimpan: {
        flex: 1,
        backgroundColor: '#2563eb',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnSimpanText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});