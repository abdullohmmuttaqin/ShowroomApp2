import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const dataAwal = [
    {
        id: 1,
        nama: 'Budi Santoso',
        mobil: 'Toyota Avanza',
        sisa: 50000000,
        jatuhTempo: '15 Juni 2026',
    },
    {
        id: 2,
        nama: 'Andi Pratama',
        mobil: 'Honda Jazz',
        sisa: 25000000,
        jatuhTempo: '20 Juni 2026',
    },
];

const STORAGE_KEY = 'piutang_showroom';
const formatRupiah = (value) => {
    const angka = value.replace(/[^0-9]/g, '');

    if (!angka) {
        return '';
    }

    return `Rp ${parseInt(angka, 10).toLocaleString('id-ID')}`;
};

export default function PiutangScreen() {

    const [dataPiutang, setDataPiutang] = useState(dataAwal);
    const [jumlahJatuhTempo, setJumlahJatuhTempo] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [namaPelanggan, setNamaPelanggan] = useState('');
    const [namaMobil, setNamaMobil] = useState('');
    const [sisaPiutang, setSisaPiutang] = useState('');
    const [jatuhTempo, setJatuhTempo] = useState('');
    const [piutangDipilih, setPiutangDipilih] = useState(null);
    const [modalBayarVisible, setModalBayarVisible] = useState(false);
    const [nominalBayar, setNominalBayar] = useState('');
    const nominalBayarRef = useRef(null);

    useEffect(() => {
        bacaDataPiutang();
    }, []);

    useEffect(() => {
        simpanDataPiutang();
    }, [dataPiutang]);

    useEffect(() => {
        if (modalBayarVisible) {
            setTimeout(() => {
                nominalBayarRef.current?.focus();
            }, 300);
        }
    }, [modalBayarVisible]);

    const bacaDataPiutang = async () => {
        try {
            const dataTersimpan =
                await AsyncStorage.getItem(STORAGE_KEY);

            if (dataTersimpan !== null) {
                setDataPiutang(
                    JSON.parse(dataTersimpan)
                );
            } else {
                await AsyncStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(dataAwal)
                );
            }
        } catch (error) {
            console.log(
                'Error baca piutang:',
                error
            );
        }
    };

    const simpanDataPiutang = async () => {
        try {
            await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(dataPiutang)
            );
        } catch (error) {
            console.log(
                'Error simpan piutang:',
                error
            );
        }
    };

    const simpanPiutang = () => {

        if (
            !namaPelanggan ||
            !namaMobil ||
            !sisaPiutang ||
            !jatuhTempo
        ) {
            return;
        }

        const piutangBaru = {
            id: Date.now(),
            nama: namaPelanggan,
            mobil: namaMobil,
            sisa: parseInt(sisaPiutang),
            jatuhTempo: jatuhTempo,
        };

        setDataPiutang([
            piutangBaru,
            ...dataPiutang,
        ]);

        setNamaPelanggan('');
        setNamaMobil('');
        setSisaPiutang('');
        setJatuhTempo('');

        setModalVisible(false);
    };

    const prosesPembayaran = () => {

        if (!nominalBayar.trim()) {
            Alert.alert(
                'Peringatan',
                'Masukkan nominal pembayaran.'
            );
            return;
        }

        const bayar = parseInt(nominalBayar, 10);

        if (bayar <= 0) {
            Alert.alert(
                'Peringatan',
                'Nominal pembayaran harus lebih dari 0.'
            );
            return;
        }

        if (bayar > piutangDipilih.sisa) {
            Alert.alert(
                'Peringatan',
                'Nominal pembayaran melebihi sisa piutang.'
            );
            return;
        }

        const dataBaru = dataPiutang
            .map((item) => {
                if (item.id === piutangDipilih.id) {
                    return {
                        ...item,
                        sisa: item.sisa - bayar,
                    };
                }

                return item;
            })
            .filter((item) => item.sisa > 0);

        Alert.alert(
            'Konfirmasi Pembayaran',
            `Terima pembayaran Rp ${bayar.toLocaleString('id-ID')} ?`,
            [
                {
                    text: 'Batal',
                    style: 'cancel',
                },
                {
                    text: 'Ya, Bayar',
                    onPress: () => {
                        setDataPiutang(dataBaru);

                        setNominalBayar('');
                        setPiutangDipilih(null);
                        setModalBayarVisible(false);

                        Alert.alert(
                            'Berhasil',
                            'Pembayaran piutang berhasil disimpan.'
                        );
                    },
                },
            ]
        );
    };

    useEffect(() => {
        setJumlahJatuhTempo(dataPiutang.length);
    }, [dataPiutang]);

    const totalPiutang = dataPiutang.reduce(
        (total, item) => total + item.sisa,
        0
    );
    return (
        <ScrollView style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.title}>
                    Piutang
                </Text>

                <Text style={styles.subtitle}>
                    Kelola tagihan pelanggan
                </Text>
            </View>

            <View style={styles.heroCard}>
                <Text style={styles.heroTitle}>
                    Total Piutang
                </Text>

                <Text style={styles.heroAmount}>
                    Rp {totalPiutang.toLocaleString('id-ID')}
                </Text>

                <Text style={styles.heroSubtitle}>
                    {dataPiutang.length} piutang aktif
                </Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.card}>
                    <Text style={styles.cardNumber}>
                        {dataPiutang.length}
                    </Text>
                    <Text style={styles.cardLabel}>
                        Piutang Aktif
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardNumber}>
                        {jumlahJatuhTempo}
                    </Text>
                    <Text style={styles.cardLabel}>
                        Jatuh Tempo
                    </Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>
                Daftar Piutang
            </Text>

            {dataPiutang.map((item) => (
                <View key={item.id} style={styles.piutangCard}>

                    <Text style={styles.namaCustomer}>
                        {item.nama}
                    </Text>

                    <Text style={styles.namaMobil}>
                        {item.mobil}
                    </Text>

                    <Text style={styles.nominalPiutang}>
                        Rp {item.sisa.toLocaleString('id-ID')}
                    </Text>

                    <Text style={styles.jatuhTempo}>
                        Jatuh Tempo: {item.jatuhTempo}
                    </Text>

                    <TouchableOpacity
                        style={styles.btnBayar}
                        onPress={() => {
                            setPiutangDipilih(item);
                            setNominalBayar('');
                            setModalBayarVisible(true);
                        }}
                    >
                        <Text style={styles.btnBayarText}>
                            Bayar
                        </Text>
                    </TouchableOpacity>

                </View>
            ))}



            <TouchableOpacity
                style={styles.tombolTambah}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.tombolTambahText}>
                    + Tambah Piutang
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
                            Tambah Piutang
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nama Pelanggan"
                            value={namaPelanggan}
                            onChangeText={setNamaPelanggan}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Nama Mobil"
                            value={namaMobil}
                            onChangeText={setNamaMobil}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Sisa Piutang"
                            value={sisaPiutang}
                            onChangeText={setSisaPiutang}
                            keyboardType="numeric"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Jatuh Tempo"
                            value={jatuhTempo}
                            onChangeText={setJatuhTempo}
                        />

                        <View style={styles.modalButtonContainer}>

                            <TouchableOpacity
                                style={styles.btnTutup}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.btnTutupText}>
                                    Tutup
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.btnSimpan}
                                onPress={simpanPiutang}
                            >
                                <Text style={styles.btnSimpanText}>
                                    Simpan
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>
                </View>
            </Modal>

            <Modal
                visible={modalBayarVisible}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>

                    <View style={styles.modalContainer}>

                        <Text style={styles.modalTitle}>
                            Pembayaran Piutang
                        </Text>

                        <Text style={styles.detailLabel}>
                            Nama Pelanggan
                        </Text>

                        <Text style={styles.detailValue}>
                            {piutangDipilih?.nama}
                        </Text>

                        <Text style={styles.detailLabel}>
                            Mobil
                        </Text>

                        <Text style={styles.detailValue}>
                            {piutangDipilih?.mobil}
                        </Text>

                        <Text style={styles.detailLabel}>
                            Jatuh Tempo
                        </Text>

                        <Text style={styles.detailValue}>
                            {piutangDipilih?.jatuhTempo}
                        </Text>

                        <Text style={styles.detailLabel}>
                            Sisa Piutang
                        </Text>

                        <Text style={styles.detailNominal}>
                            Rp {piutangDipilih?.sisa?.toLocaleString('id-ID')}
                        </Text>

                        <TextInput
                            ref={nominalBayarRef}
                            style={styles.input}
                            placeholder="Masukkan nominal pembayaran"
                            value={formatRupiah(nominalBayar)}
                            onChangeText={(text) =>
                                setNominalBayar(text.replace(/[^0-9]/g, ''))
                            }
                            keyboardType="numeric"
                        />

                        <View style={styles.modalButtonContainer}>

                            <TouchableOpacity
                                style={styles.btnTutup}
                                onPress={() => {
                                    setNominalBayar('');
                                    setPiutangDipilih(null);
                                    setModalBayarVisible(false);
                                }}
                            >
                                <Text style={styles.btnTutupText}>
                                    Tutup
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.btnSimpan,
                                    nominalBayar.trim() === '' && styles.btnDisabled,
                                ]}
                                onPress={prosesPembayaran}
                            >
                                <Text style={styles.btnSimpanText}>
                                    Bayar
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

    emptyCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },

    emptyText: {
        color: '#666',
    },

    piutangCard: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },

    namaCustomer: {
        fontSize: 16,
        fontWeight: 'bold',
    },

    namaMobil: {
        color: '#666',
        marginTop: 4,
    },

    nominalPiutang: {
        color: '#dc2626',
        fontWeight: 'bold',
        marginTop: 8,
    },

    jatuhTempo: {
        color: '#777',
        marginTop: 4,
        fontSize: 12,
    },

    tombolTambah: {
        backgroundColor: '#2563eb',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },

    tombolTambahText: {
        color: '#ffffff',
        fontWeight: 'bold',
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

    btnTutup: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },

    btnTutupText: {
        color: '#111827',
        fontWeight: '600',
    },

    modalButtonContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },

    btnSimpan: {
        flex: 1,
        backgroundColor: '#2563eb',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },

    btnBayar: {
        backgroundColor: '#16a34a',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },

    btnBayarText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },

    btnTutupBayar: {
        backgroundColor: '#f3f4f6',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
    },

    btnTutupBayarText: {
        color: '#111827',
        fontWeight: '600',
    },

    btnSimpanText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },

    detailLabel: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 10,
    },

    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginTop: 2,
        marginBottom: 8,
    },

    detailNominal: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#dc2626',
        marginTop: 2,
        marginBottom: 16,
    },

    btnDisabled: {
        backgroundColor: '#9ca3af',
    },
});