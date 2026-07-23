import { tambahAktivitas } from "../utils/aktivitas";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const STORAGE_KEY = "stok_showroom";

const dataAwal = [
  {
    id: 1,
    merk: "Toyota",
    tipe: "Avanza",
    tahun: 2021,
    harga: 180000000,
    status: "tersedia",
    nopol: "B 1234 ABC",
    foto: null,
  },
  {
    id: 2,
    merk: "Honda",
    tipe: "Jazz",
    tahun: 2020,
    harga: 150000000,
    status: "terjual",
    nopol: "B 5678 DEF",
    foto: null,
  },
  {
    id: 3,
    merk: "Suzuki",
    tipe: "Ertiga",
    tahun: 2022,
    harga: 160000000,
    status: "tersedia",
    nopol: "B 9012 GHI",
    foto: null,
  },
  {
    id: 4,
    merk: "Daihatsu",
    tipe: "Xenia",
    tahun: 2021,
    harga: 130000000,
    status: "tersedia",
    nopol: "B 3456 JKL",
    foto: null,
  },
  {
    id: 5,
    merk: "Mitsubishi",
    tipe: "Xpander",
    tahun: 2022,
    harga: 210000000,
    status: "terjual",
    nopol: "B 7890 MNO",
    foto: null,
  },
  {
    id: 6,
    merk: "Toyota",
    tipe: "Fortuner",
    tahun: 2021,
    harga: 450000000,
    status: "tersedia",
    nopol: "B 2468 PQR",
    foto: null,
  },
];

const formatRupiah = (angka) => {
  return "Rp " + angka.toLocaleString("id-ID");
};

export default function StokScreen() {
  const [stok, setStok] = useState([]);
  const [cari, setCari] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [formMerk, setFormMerk] = useState("");
  const [formTipe, setFormTipe] = useState("");
  const [formTahun, setFormTahun] = useState("");
  const [formHarga, setFormHarga] = useState("");
  const [formNopol, setFormNopol] = useState("");
  const [formFoto, setFormFoto] = useState(null);

  // Menyimpan ID mobil yang sedang diedit
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    bacaData();
  }, []);

  const bacaData = async () => {
    try {
      const dataTersimpan = await AsyncStorage.getItem(STORAGE_KEY);
      if (dataTersimpan !== null) {
        setStok(JSON.parse(dataTersimpan));
      } else {
        setStok(dataAwal);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataAwal));
      }
    } catch (e) {
      console.log("Error baca data:", e);
    }
  };

  const simpanData = async (dataBaru) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataBaru));
    } catch (e) {
      console.log("Error simpan data:", e);
    }
  };

  // Fungsi ubah status mobil — tersedia jadi terjual atau sebaliknya
  const ubahStatus = async (id) => {
    const dataBaru = stok.map((mobil) => {
      if (mobil.id === id) {
        return {
          ...mobil,
          status: mobil.status === "tersedia" ? "terjual" : "tersedia",
        };
      }
      return mobil;
    });
    setStok(dataBaru);
    await simpanData(dataBaru);
  };

  // Fungsi hapus stok — tampilkan konfirmasi dulu
  const hapusStok = (id) => {
    const mobil = stok.find((item) => item.id === id);

    Alert.alert("Hapus Stok", "Yakin ingin menghapus mobil ini dari stok?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          const dataBaru = stok.filter((item) => item.id !== id);

          setStok(dataBaru);

          await simpanData(dataBaru);

          await tambahAktivitas(
            `🗑️ ${mobil.merk} ${mobil.tipe} dihapus dari stok`,
          );
        },
      },
    ]);
  };

  const stokFiltered = stok.filter(
    (mobil) =>
      mobil.merk.toLowerCase().includes(cari.toLowerCase()) ||
      mobil.tipe.toLowerCase().includes(cari.toLowerCase()) ||
      (mobil.nopol || "")
        .toLowerCase()
        .replace(/\s/g, "")
        .includes(cari.toLowerCase().replace(/\s/g, "")),
  );

  const pilihFoto = async () => {
    const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!izin.granted) {
      Alert.alert(
        "Izin Ditolak",
        "Aplikasi butuh akses galeri untuk memilih foto.",
      );
      return;
    }

    const hasil = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!hasil.canceled) {
      setFormFoto(hasil.assets[0].uri);
    }
  };

  const editStok = (mobil) => {
    setFormMerk(mobil.merk);
    setFormTipe(mobil.tipe);
    setFormTahun(mobil.tahun.toString());
    setFormHarga(mobil.harga.toString());
    setFormNopol(mobil.nopol || "");
    setFormFoto(mobil.foto || null);

    setEditId(mobil.id);

    setModalVisible(true);
  };

  const tambahStok = async () => {
    if (!formMerk || !formTipe || !formTahun || !formHarga || !formNopol) {
      Alert.alert("Peringatan", "Semua field wajib diisi.");
      return;
    }

    if (!/^\d+$/.test(formTahun) || !/^\d+$/.test(formHarga)) {
      Alert.alert("Peringatan", "Tahun dan harga hanya boleh berisi angka.");
      return;
    }

    const tahunBaru = parseInt(formTahun, 10);
    const hargaBaru = parseInt(formHarga, 10);

    if (!Number.isFinite(tahunBaru) || !Number.isFinite(hargaBaru)) {
      Alert.alert(
        "Peringatan",
        "Tahun dan harga harus berupa angka yang valid.",
      );
      return;
    }

    if (tahunBaru <= 0 || hargaBaru <= 0) {
      Alert.alert("Peringatan", "Tahun dan harga harus lebih dari 0.");
      return;
    }

    let dataBaru = [];

    if (editId !== null) {
      dataBaru = stok.map((mobil) =>
        mobil.id === editId
          ? {
              ...mobil,
              merk: formMerk,
              tipe: formTipe,
              tahun: tahunBaru,
              harga: hargaBaru,
              nopol: formNopol.trim().toUpperCase(),
              foto: formFoto,
            }
          : mobil,
      );

      setStok(dataBaru);
      await simpanData(dataBaru);

      await tambahAktivitas(`✏️ ${formMerk} ${formTipe} diperbarui`);
    } else {
      const baru = {
        id: Date.now(),
        merk: formMerk,
        tipe: formTipe,
        tahun: tahunBaru,
        harga: hargaBaru,
        status: "tersedia",
        nopol: formNopol.trim().toUpperCase(),
        foto: formFoto,
      };

      dataBaru = [...stok, baru];

      setStok(dataBaru);
      await simpanData(dataBaru);

      await tambahAktivitas(`🚗 ${formMerk} ${formTipe} ditambahkan ke stok`);
    }

    setFormMerk("");
    setFormTipe("");
    setFormTahun("");
    setFormHarga("");
    setFormNopol("");
    setFormFoto(null);

    setEditId(null);

    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerJudul}>Stok Mobil</Text>
        <Text style={styles.headerSub}>{stok.length} unit terdaftar</Text>
      </View>

      {/* Statistik */}
      <View style={styles.statistikContainer}>
        <View style={styles.statistikCard}>
          <Text style={styles.statistikAngka}>{stok.length}</Text>
          <Text style={styles.statistikLabel}>Total</Text>
        </View>
        <View style={styles.statistikCard}>
          <Text style={[styles.statistikAngka, { color: "#16a34a" }]}>
            {stok.filter((m) => m.status === "tersedia").length}
          </Text>
          <Text style={styles.statistikLabel}>Tersedia</Text>
        </View>
        <View style={styles.statistikCard}>
          <Text style={[styles.statistikAngka, { color: "#dc2626" }]}>
            {stok.filter((m) => m.status === "terjual").length}
          </Text>
          <Text style={styles.statistikLabel}>Terjual</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari merk, tipe, atau nopol..."
          value={cari}
          onChangeText={setCari}
        />
      </View>

      {/* List stok */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {stokFiltered.map((mobil) => (
          <View key={mobil.id} style={styles.kartu}>
            {mobil.foto && (
              <Image
                source={{ uri: mobil.foto }}
                style={styles.fotoThumbnail}
              />
            )}

            {/* Baris atas: nama + badge */}
            <View style={styles.kartuHeader}>
              <Text style={styles.namaMobil}>
                {mobil.merk} {mobil.tipe}
              </Text>
              <View
                style={
                  mobil.status === "tersedia"
                    ? styles.badgeHijau
                    : styles.badgeMerah
                }
              >
                <Text
                  style={
                    mobil.status === "tersedia"
                      ? styles.badgeTeksHijau
                      : styles.badgeTeksMerah
                  }
                >
                  {mobil.status}
                </Text>
              </View>
            </View>

            {/* Info tahun, nopol & harga */}
            <Text style={styles.tahun}>
              Tahun {mobil.tahun} • {mobil.nopol || "-"}
            </Text>
            <Text style={styles.harga}>{formatRupiah(mobil.harga)}</Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Tombol aksi */}
            <View style={styles.tombolWrapper}>
              <TouchableOpacity
                style={
                  mobil.status === "tersedia"
                    ? styles.tombolTerjual
                    : styles.tombolTersedia
                }
                onPress={() => ubahStatus(mobil.id)}
              >
                <Text style={styles.tombolStatusTeks}>
                  {mobil.status === "tersedia" ? "Terjual" : "Tersedia"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tombolEdit}
                onPress={() => editStok(mobil)}
              >
                <Text style={styles.tombolEditTeks}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tombolHapus}
                onPress={() => hapusStok(mobil.id)}
              >
                <Text style={styles.tombolHapusTeks}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 8 }} />
      </ScrollView>

      {/* Tombol tambah */}
      <TouchableOpacity
        style={styles.tombolTambah}
        onPress={() => {
          setFormMerk("");
          setFormTipe("");
          setFormTahun("");
          setFormHarga("");
          setFormNopol("");
          setFormFoto(null);
          setEditId(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.tombolTambahTeks}>+ Tambah Stok</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalKonten}>
            <Text style={styles.modalJudul}>
              {editId !== null ? "Edit Stok Mobil" : "Tambah Stok Mobil"}
            </Text>

            <Text style={styles.inputLabel}>Merk</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Toyota"
              value={formMerk}
              onChangeText={setFormMerk}
            />

            <Text style={styles.inputLabel}>Tipe</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Avanza"
              value={formTipe}
              onChangeText={setFormTipe}
            />

            <Text style={styles.inputLabel}>Foto Mobil</Text>
            <TouchableOpacity
              style={styles.tombolPilihFoto}
              onPress={pilihFoto}
            >
              {formFoto ? (
                <Image source={{ uri: formFoto }} style={styles.previewFoto} />
              ) : (
                <Text style={styles.tombolPilihFotoTeks}>+ Pilih Foto</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Nomor Polisi</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: B 1234 ABC"
              value={formNopol}
              onChangeText={setFormNopol}
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Tahun</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 2022"
              value={formTahun}
              onChangeText={setFormTahun}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Harga (Rp)</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 180000000"
              value={formHarga}
              onChangeText={setFormHarga}
              keyboardType="numeric"
            />

            <View style={styles.modalTombol}>
              <TouchableOpacity
                style={styles.tombolBatal}
                onPress={() => {
                  setFormMerk("");
                  setFormTipe("");
                  setFormTahun("");
                  setFormHarga("");
                  setFormNopol("");
                  setFormFoto(null);
                  setEditId(null);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.tombolBatalTeks}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tombolSimpan}
                onPress={tambahStok}
              >
                <Text style={styles.tombolSimpanTeks}>
                  {editId !== null ? "Update" : "Simpan"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  header: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 20,
  },
  headerJudul: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSub: {
    fontSize: 13,
    color: "#bfdbfe",
    marginTop: 4,
  },
  statistikContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  statistikCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  statistikAngka: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563eb",
  },
  statistikLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 1,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  kartu: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  kartuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  namaMobil: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  tahun: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  harga: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 12,
  },
  tombolWrapper: {
    flexDirection: "row",
    gap: 6,
  },
  tombolTerjual: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tombolTersedia: {
    backgroundColor: "#dcfce7",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tombolStatusTeks: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  tombolEdit: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tombolEditTeks: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563eb",
  },
  tombolHapus: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tombolHapusTeks: {
    fontSize: 11,
    fontWeight: "600",
    color: "#dc2626",
  },
  badgeHijau: {
    backgroundColor: "#dcfce7",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeMerah: {
    backgroundColor: "#fee2e2",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeTeksHijau: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16a34a",
    textTransform: "capitalize",
  },
  badgeTeksMerah: {
    fontSize: 11,
    fontWeight: "600",
    color: "#dc2626",
    textTransform: "capitalize",
  },
  tombolTambah: {
    backgroundColor: "#2563eb",
    margin: 16,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  tombolTambahTeks: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalKonten: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalJudul: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827",
  },
  inputLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  modalTombol: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  tombolBatal: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  tombolBatalTeks: {
    color: "#6b7280",
    fontWeight: "600",
  },
  tombolSimpan: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  tombolSimpanTeks: {
    color: "#fff",
    fontWeight: "bold",
  },
  fotoThumbnail: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#f3f4f6",
  },
  tombolPilihFoto: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tombolPilihFotoTeks: {
    color: "#9ca3af",
    fontSize: 13,
  },
  previewFoto: {
    width: "100%",
    height: "100%",
  },
});
