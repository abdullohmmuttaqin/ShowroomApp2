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

    const [namaMobil, setNamaMobil] = useState('');
    const [hargaJual, setHargaJual] = useState('');
    const [tanggalJual, setTanggalJual] = useState('');

    const [dataPenjualan, setDataPenjualan] = useState(dataAwal);

    useEffect(() => {
        bacaDataPenjualan();
    }, []);

    const bacaDataPenjualan = async () => {
        try {
            const dataTersimpan = await AsyncStorage.getItem(STORAGE_KEY);

            if (dataTersimpan !== null) {
                setDataPenjualan(JSON.parse(dataTersimpan));
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

    const simpanPenjualan = () => {

        if (!namaMobil || !hargaJual || !tanggalJual) {
            return;
        }

        const transaksiBaru = {
            id: Date.now(),
            mobil: namaMobil,
            harga: parseInt(hargaJual),
            tanggal: tanggalJual,
            status: 'Lunas',
        };

        const dataBaru = [
            transaksiBaru,
            ...dataPenjualan,
        ];

        setDataPenjualan(dataBaru);

        simpanDataPenjualan(dataBaru);

        setNamaMobil('');
        setHargaJual('');
        setTanggalJual('');

        setModalVisible(false);
    };

    return (
        <ScrollView style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.title}>Penjualan</Text>
                <Text style={styles.subtitle}>
                    Ringkasan transaksi showroom
                </Text>
            </View>

            <View style={styles.heroCard}>
                <Text style={styles.heroTitle}>
                    Omset Bulan Ini
                </Text>

                <Text style={styles.heroAmount}>
                    {formatRupiah(totalOmset)}
                </Text>

                <Text style={styles.heroSubtitle}>
                    Dari {dataPenjualan.length} transaksi
                </Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.card}>
                    <Text style={styles.cardNumber}>
                        {dataPenjualan.length}
                    </Text>
                    <Text style={styles.cardLabel}>
                        🚗 Unit Terjual
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardNumber}>
                        {formatRupiah(totalOmset)}
                    </Text>
                    <Text style={styles.cardLabel}>
                        💰 Total Omset
                    </Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>
                Riwayat Penjualan
            </Text>

            {dataPenjualan.map((item) => (
                <View key={item.id} style={styles.saleCard}>
                    <Text style={styles.carName}>
                        {item.mobil}
                    </Text>

                    <Text style={styles.price}>
                        {formatRupiah(item.harga)}
                    </Text>

                    <Text style={styles.date}>
                        {item.tanggal}
                    </Text>

                    <Text
                        style={
                            item.status === 'Lunas'
                                ? styles.statusLunas
                                : styles.statusDP
                        }
                    >
                        ● {item.status}
                    </Text>

                </View>
            ))}

            <TouchableOpacity
                style={styles.tombolTambah}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.tombolTambahTeks}>
                    + Tambah Penjualan
                </Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
            >
                <View style={styles.modalOverlay}>

                    <View style={styles.modalContainer}>

                        <Text style={styles.modalTitle}>
                            Tambah Penjualan
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

                        <TextInput
                            style={styles.input}
                            placeholder="Tanggal"
                            value={tanggalJual}
                            onChangeText={setTanggalJual}
                        />

                        <View style={styles.modalButtonContainer}>

                            <TouchableOpacity
                                style={styles.btnBatal}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text>Batal</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.btnSimpan}
                                onPress={simpanPenjualan}
                            >
                                <Text style={styles.btnSimpanText}>
                                    Simpan
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                </View>
            </Modal>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fb',
        padding: 20,
    },

    header: {
        marginTop: 50,
        marginBottom: 20,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },

    subtitle: {
        color: '#666',
        marginTop: 4,
    },

    statsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },

    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
    },

    cardNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2563eb',
    },

    cardLabel: {
        marginTop: 5,
        color: '#666',
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },

    saleCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },

    carName: {
        fontSize: 16,
        fontWeight: 'bold',
    },

    price: {
        color: '#2563eb',
        marginTop: 5,
        fontWeight: '600',
    },

    date: {
        color: '#777',
        marginTop: 5,
        fontSize: 12,
    },

    heroCard: {
        backgroundColor: '#2563eb',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },

    heroTitle: {
        color: '#bfdbfe',
        fontSize: 14,
    },

    heroAmount: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 8,
    },

    heroSubtitle: {
        color: '#dbeafe',
        marginTop: 4,
    },

    statusLunas: {
        color: '#16a34a',
        marginTop: 8,
        fontWeight: '600',
    },

    statusDP: {
        color: '#f59e0b',
        marginTop: 8,
        fontWeight: '600',
    },

    tombolTambah: {
        backgroundColor: '#2563eb',
        marginTop: 20,
        marginBottom: 30,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },

    tombolTambahTeks: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 15,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },

    modalContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },

    input: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
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