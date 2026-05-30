import { View, Text, StyleSheet } from 'react-native';

// HomeScreen adalah halaman pertama yang muncul saat aplikasi dibuka
export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.judul}>Dashboard</Text>
            <Text style={styles.subjudul}>Selamat datang di Showroom Mobil</Text>
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