import { View, Text, StyleSheet } from 'react-native';

// LaporanScreen adalah halaman untuk melihat laporan keuangan showroom
export default function LaporanScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.judul}>Laporan</Text>
            <Text style={styles.subjudul}>Rekap keuangan showroom</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    judul: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subjudul: {
        fontSize: 14,
        color: 'gray',
        marginTop: 8,
    },
});