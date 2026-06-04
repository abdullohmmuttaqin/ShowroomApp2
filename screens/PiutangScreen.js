import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function PiutangScreen() {
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
                    Rp 0
                </Text>

                <Text style={styles.heroSubtitle}>
                    Belum ada piutang aktif
                </Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.card}>
                    <Text style={styles.cardNumber}>0</Text>
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

            <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                    Belum ada data piutang
                </Text>
            </View>

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
});