import { View, Text, StyleSheet, ScrollView } from 'react-native';

const dataPiutang = [
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
export default function PiutangScreen() {

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
                    Belum ada piutang aktif
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
                    <Text style={styles.cardNumber}>0</Text>
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
});