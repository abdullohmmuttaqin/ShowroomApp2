import { View, Text, StyleSheet } from 'react-native';

// StokScreen adalah halaman untuk melihat daftar stok mobil yang tersedia
export default function StokScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.judul}>Stok Mobil</Text>
            <Text style={styles.subjudul}>Daftar mobil yang tersedia</Text>
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