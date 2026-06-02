import { View, Text, StyleSheet, ScrollView } from 'react-native';

const dataPenjualan = [
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
    const totalOmset = dataPenjualan.reduce(
        (total, item) => total + item.harga,
        0
    );

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
});