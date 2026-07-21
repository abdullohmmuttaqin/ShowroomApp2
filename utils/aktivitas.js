import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_AKTIVITAS = 'aktivitas_showroom';

export const tambahAktivitas = async (teks) => {
    try {

        const data =
            await AsyncStorage.getItem(
                STORAGE_KEY_AKTIVITAS
            );

        const aktivitas = data
            ? JSON.parse(data)
            : [];

        aktivitas.unshift({
            id: Date.now(),
            teks,
            waktu: new Date().toISOString(),
        });

        await AsyncStorage.setItem(
            STORAGE_KEY_AKTIVITAS,
            JSON.stringify(aktivitas)
        );

    } catch (error) {

        console.log(
            'Error tambah aktivitas:',
            error
        );
    }
};