import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function DashboardScreen() {
    return (
        <View style={styles.container}>

            {/* Header */}
            <Text style={styles.title}>
                Dashboard Showroom
            </Text>

            {/* Statistik */}
            <View style={styles.statsContainer}>

                <View style={styles.card}>
                    <Text style={styles.cardNumber}>25</Text>
                    <Text style={styles.cardLabel}>Total Stok</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardNumber}>8</Text>
                    <Text style={styles.cardLabel}>Terjual</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardNumber}>3</Text>
                    <Text style={styles.cardLabel}>Piutang</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardNumber}>120JT</Text>
                    <Text style={styles.cardLabel}>Kas</Text>
                </View>

            </View>

            {/* Shortcut Menu */}
            <Text style={styles.sectionTitle}>
                Menu Cepat
            </Text>

            <View style={styles.menuContainer}>

                <TouchableOpacity style={styles.menuButton}>
                    <Text>Transaksi</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton}>
                    <Text>Piutang</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton}>
                    <Text>Kas & Bank</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton}>
                    <Text>Pengaturan</Text>
                </TouchableOpacity>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f7fb',
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 50,
        marginBottom: 20,
    },

    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    card: {
        width: '48%',
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
    },

    cardNumber: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    cardLabel: {
        marginTop: 5,
        color: '#666',
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },

    menuContainer: {
        gap: 10,
    },

    menuButton: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 12,
    },
});