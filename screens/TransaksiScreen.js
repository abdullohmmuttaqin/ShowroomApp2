import { View, Text, StyleSheet } from 'react-native';

// TransaksiScreen adalah halaman untuk mencatat transaksi jual/beli mobil
export default function TransaksiScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.judul}>Transaksi</Text>
            <Text style={styles.subjudul}>Catat transaksi jual/beli mobil</Text>
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