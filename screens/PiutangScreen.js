import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { tambahAktivitas } from "../utils/aktivitas";
import { supabase } from "../utils/supabase";

const formatRupiah = (value) => {
  if (!value && value !== 0) return "";

  const str = String(value);
  const angka = str.replace(/[^0-9]/g, "");

  if (!angka) {
    return "";
  }

  return `Rp ${parseInt(angka, 10).toLocaleString("id-ID")}`;
};

export default function PiutangScreen() {
  const [dataPiutang, setDataPiutang] = useState([]);
  const [jumlahJatuhTempo, setJumlahJatuhTempo] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [namaMobil, setNamaMobil] = useState("");
  const [sisaPiutang, setSisaPiutang] = useState("");
  const [jatuhTempo, setJatuhTempo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [piutangDipilih, setPiutangDipilih] = useState(null);
  const [modalBayarVisible, setModalBayarVisible] = useState(false);
  const [nominalBayar, setNominalBayar] = useState("");
  const [riwayatPembayaran, setRiwayatPembayaran] = useState([]);
  const nominalBayarRef = useRef(null);
  const [modeEdit, setModeEdit] = useState(false);
  const [idEdit, setIdEdit] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    bacaDataPiutang();
    bacaRiwayatPembayaran();
  }, []);

  useEffect(() => {
    if (modalBayarVisible) {
      setTimeout(() => {
        nominalBayarRef.current?.focus();
      }, 300);
    }
  }, [modalBayarVisible]);

  // Ubah data dari format database (jatuh_tempo) ke format yang dipakai di UI (jatuhTempo)
  const mapDariDb = (item) => ({
    id: item.id,
    nama: item.nama,
    mobil: item.mobil,
    sisa: item.sisa,
    jatuhTempo: item.jatuh_tempo,
  });

  const bacaDataPiutang = async () => {
    try {
      const { data, error } = await supabase
        .from("piutang")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      setDataPiutang(data.map(mapDariDb));
    } catch (error) {
      console.log("Error baca piutang:", error.message);
      Alert.alert("Gagal", "Tidak bisa memuat data piutang.");
    }
  };

  const bacaRiwayatPembayaran = async () => {
    try {
      const { data, error } = await supabase
        .from("riwayat_pembayaran")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      setRiwayatPembayaran(data);
    } catch (error) {
      console.log("Error baca riwayat pembayaran:", error.message);
    }
  };

  const pilihTanggal = (event, date) => {
    setShowDatePicker(false);

    if (event.type === "dismissed") {
      return;
    }

    if (!date) {
      return;
    }

    setSelectedDate(date);

    const tanggalFormat = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    setJatuhTempo(tanggalFormat);
  };

  const simpanPiutang = async () => {
    if (isSaving) return;
    setIsSaving(true);

    if (!namaPelanggan.trim()) {
      Alert.alert("Peringatan", "Nama pelanggan wajib diisi.");
      setIsSaving(false);
      return;
    }

    if (!namaMobil.trim()) {
      Alert.alert("Peringatan", "Nama mobil wajib diisi.");
      setIsSaving(false);
      return;
    }

    const sisaSanitized = Number(sisaPiutang.toString().replace(/[^0-9]/g, ""));

    if (!sisaSanitized || sisaSanitized <= 0) {
      Alert.alert("Peringatan", "Sisa piutang harus lebih dari 0.");
      setIsSaving(false);
      return;
    }

    if (!jatuhTempo) {
      Alert.alert("Peringatan", "Pilih tanggal jatuh tempo.");
      setIsSaving(false);
      return;
    }

    if (modeEdit) {
      Alert.alert("Konfirmasi Update", "Simpan perubahan data piutang?", [
        {
          text: "Batal",
          style: "cancel",
          onPress: () => setIsSaving(false),
        },
        {
          text: "Update",
          onPress: async () => {
            try {
              const { data, error } = await supabase
                .from("piutang")
                .update({
                  nama: namaPelanggan.trim(),
                  mobil: namaMobil.trim(),
                  sisa: sisaSanitized,
                  jatuh_tempo: jatuhTempo,
                })
                .eq("id", idEdit)
                .select()
                .single();

              if (error) throw error;

              setDataPiutang((prev) =>
                prev.map((item) =>
                  item.id === idEdit ? mapDariDb(data) : item,
                ),
              );

              await tambahAktivitas(`✏️ Piutang ${namaPelanggan} diperbarui`);

              setNamaPelanggan("");
              setNamaMobil("");
              setSisaPiutang("");
              setJatuhTempo("");
              setSelectedDate(new Date());
              setModeEdit(false);
              setIdEdit(null);
              setModalVisible(false);

              Alert.alert("Berhasil", "Data piutang berhasil diperbarui.");
            } catch (error) {
              console.log("Error update piutang:", error.message);
              Alert.alert("Gagal", "Tidak bisa memperbarui data.");
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("piutang")
        .insert({
          nama: namaPelanggan.trim(),
          mobil: namaMobil.trim(),
          sisa: sisaSanitized,
          jatuh_tempo: jatuhTempo,
        })
        .select()
        .single();

      if (error) throw error;

      setDataPiutang((prev) => [mapDariDb(data), ...prev]);

      await tambahAktivitas(`📝 Piutang ${namaPelanggan} ditambahkan`);

      setNamaPelanggan("");
      setNamaMobil("");
      setSisaPiutang("");
      setJatuhTempo("");
      setSelectedDate(new Date());
      setModeEdit(false);
      setIdEdit(null);
      setModalVisible(false);
    } catch (error) {
      console.log("Error simpan piutang:", error.message);
      Alert.alert("Gagal", "Tidak bisa menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  const prosesPembayaran = () => {
    if (isProcessingPayment) return;

    if (!nominalBayar || !nominalBayar.toString().trim()) {
      Alert.alert("Peringatan", "Masukkan nominal pembayaran.");
      return;
    }

    const bayar = Number(nominalBayar);

    if (isNaN(bayar) || bayar <= 0) {
      Alert.alert("Peringatan", "Nominal pembayaran tidak valid.");
      return;
    }

    if (!piutangDipilih) {
      Alert.alert("Peringatan", "Pilih piutang terlebih dahulu.");
      return;
    }

    if (bayar > Number(piutangDipilih.sisa)) {
      Alert.alert("Peringatan", "Nominal pembayaran melebihi sisa piutang.");
      return;
    }

    Alert.alert(
      "Konfirmasi Pembayaran",
      `Terima pembayaran Rp ${bayar.toLocaleString("id-ID")} ?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Bayar",
          onPress: async () => {
            if (isProcessingPayment) return;
            setIsProcessingPayment(true);

            const sisaBaru = Number(piutangDipilih.sisa) - bayar;
            const lunas = sisaBaru <= 0;

            try {
              if (lunas) {
                const { error } = await supabase
                  .from("piutang")
                  .delete()
                  .eq("id", piutangDipilih.id);

                if (error) throw error;

                setDataPiutang((prev) =>
                  prev.filter((item) => item.id !== piutangDipilih.id),
                );
              } else {
                const { data, error } = await supabase
                  .from("piutang")
                  .update({ sisa: sisaBaru })
                  .eq("id", piutangDipilih.id)
                  .select()
                  .single();

                if (error) throw error;

                setDataPiutang((prev) =>
                  prev.map((item) =>
                    item.id === piutangDipilih.id ? mapDariDb(data) : item,
                  ),
                );
              }

              const { data: riwayatBaru, error: errorRiwayat } = await supabase
                .from("riwayat_pembayaran")
                .insert({
                  piutang_id: lunas ? null : piutangDipilih.id,
                  nama: piutangDipilih.nama,
                  mobil: piutangDipilih.mobil,
                  nominal: bayar,
                  tanggal: new Date().toLocaleString("id-ID"),
                })
                .select()
                .single();

              if (errorRiwayat) throw errorRiwayat;

              setRiwayatPembayaran((prev) => [riwayatBaru, ...prev]);

              await tambahAktivitas(
                `💰 Pembayaran piutang ${piutangDipilih.nama}`,
              );

              setModalBayarVisible(false);
              setNominalBayar("");
              setPiutangDipilih(null);

              Alert.alert("Berhasil", "Pembayaran piutang berhasil disimpan.");
            } catch (e) {
              console.log("Error proses pembayaran:", e.message);
              Alert.alert("Gagal", "Tidak bisa memproses pembayaran.");
            } finally {
              setIsProcessingPayment(false);
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    setJumlahJatuhTempo(dataPiutang.length);
  }, [dataPiutang]);

  const totalPiutang = dataPiutang.reduce(
    (total, item) => total + item.sisa,
    0,
  );

  const totalPembayaran = riwayatPembayaran.reduce(
    (total, item) => total + item.nominal,
    0,
  );

  const formValid =
    namaPelanggan.trim() !== "" &&
    namaMobil.trim() !== "" &&
    sisaPiutang.trim() !== "" &&
    parseInt(sisaPiutang, 10) > 0 &&
    jatuhTempo !== "";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Piutang</Text>
        <Text style={styles.subtitle}>Kelola tagihan pelanggan</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero total piutang */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Total Piutang</Text>
          <Text style={styles.heroAmount}>
            Rp {totalPiutang.toLocaleString("id-ID")}
          </Text>
          <Text style={styles.heroSubtitle}>
            {dataPiutang.length} piutang aktif
          </Text>
        </View>

        {/* Statistik */}
        <View style={styles.statsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{dataPiutang.length}</Text>
            <Text style={styles.cardLabel}>Piutang Aktif</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{jumlahJatuhTempo}</Text>
            <Text style={styles.cardLabel}>Jatuh Tempo</Text>
          </View>
        </View>

        {/* Daftar piutang */}
        <Text style={styles.sectionTitle}>Daftar Piutang</Text>

        {dataPiutang.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Belum ada piutang</Text>
          </View>
        ) : (
          dataPiutang.map((item) => (
            <View key={item.id} style={styles.piutangCard}>
              {/* Baris atas: nama + nominal */}
              <View style={styles.piutangCardHeader}>
                <Text style={styles.namaCustomer}>{item.nama}</Text>
                <Text style={styles.nominalPiutang}>
                  Rp {item.sisa.toLocaleString("id-ID")}
                </Text>
              </View>

              <Text style={styles.namaMobil}>{item.mobil}</Text>
              <Text style={styles.jatuhTempo}>
                Jatuh Tempo: {item.jatuhTempo}
              </Text>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Tombol aksi */}
              <View style={styles.tombolWrapper}>
                <TouchableOpacity
                  style={styles.btnEdit}
                  onPress={() => {
                    setModeEdit(true);
                    setIdEdit(item.id);
                    setNamaPelanggan(item.nama);
                    setNamaMobil(item.mobil);
                    setSisaPiutang(item.sisa.toString());
                    setJatuhTempo(item.jatuhTempo);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.btnEditText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnBayar}
                  onPress={() => {
                    setPiutangDipilih(item);
                    setNominalBayar("");
                    setModalBayarVisible(true);
                  }}
                >
                  <Text style={styles.btnBayarText}>Bayar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnHapus}
                  onPress={() => {
                    Alert.alert(
                      "Konfirmasi Hapus",
                      `Hapus piutang ${item.nama}?`,
                      [
                        { text: "Batal", style: "cancel" },
                        {
                          text: "Hapus",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              const { error } = await supabase
                                .from("piutang")
                                .delete()
                                .eq("id", item.id);

                              if (error) throw error;

                              setDataPiutang((prev) =>
                                prev.filter(
                                  (piutang) => piutang.id !== item.id,
                                ),
                              );

                              await tambahAktivitas(
                                `🗑️ Piutang ${item.nama} dihapus`,
                              );
                              setModeEdit(false);
                              setIdEdit(null);
                              Alert.alert(
                                "Berhasil",
                                "Piutang berhasil dihapus.",
                              );
                            } catch (error) {
                              console.log(
                                "Error hapus piutang:",
                                error.message,
                              );
                              Alert.alert(
                                "Gagal",
                                "Tidak bisa menghapus data.",
                              );
                            }
                          },
                        },
                      ],
                    );
                  }}
                >
                  <Text style={styles.btnHapusText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Riwayat pembayaran */}
        <Text style={styles.sectionTitle}>Riwayat Pembayaran</Text>

        <View style={styles.totalRiwayatCard}>
          <Text style={styles.totalRiwayatLabel}>Total Pembayaran</Text>
          <Text style={styles.totalRiwayatNominal}>
            Rp {totalPembayaran.toLocaleString("id-ID")}
          </Text>
        </View>

        {riwayatPembayaran.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Belum ada riwayat pembayaran</Text>
          </View>
        ) : (
          riwayatPembayaran.map((item) => (
            <View key={item.id} style={styles.riwayatCard}>
              <View style={styles.riwayatHeader}>
                <Text style={styles.namaCustomer}>{item.nama}</Text>
                <Text style={styles.nominalBayarHistory}>
                  Rp {item.nominal.toLocaleString("id-ID")}
                </Text>
              </View>
              <Text style={styles.namaMobil}>{item.mobil}</Text>
              <Text style={styles.jatuhTempo}>{item.tanggal}</Text>
            </View>
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Tombol tambah */}
      <TouchableOpacity
        style={styles.tombolTambah}
        onPress={() => {
          setModeEdit(false);
          setIdEdit(null);
          setNamaPelanggan("");
          setNamaMobil("");
          setSisaPiutang("");
          setJatuhTempo("");
          setSelectedDate(new Date());
          setModalVisible(true);
        }}
      >
        <Text style={styles.tombolTambahText}>+ Tambah Piutang</Text>
      </TouchableOpacity>

      {/* Modal tambah/edit piutang */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {modeEdit ? "Edit Piutang" : "Tambah Piutang"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nama Pelanggan"
              value={namaPelanggan}
              onChangeText={setNamaPelanggan}
            />

            <TextInput
              style={styles.input}
              placeholder="Nama Mobil"
              value={namaMobil}
              onChangeText={setNamaMobil}
            />

            <TextInput
              style={styles.input}
              placeholder="Sisa Piutang"
              value={sisaPiutang}
              onChangeText={setSisaPiutang}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: jatuhTempo ? "#111827" : "#9ca3af" }}>
                📅 {jatuhTempo || "Pilih Jatuh Tempo"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={pilihTanggal}
              />
            )}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.btnTutup}
                onPress={() => {
                  setNamaPelanggan("");
                  setNamaMobil("");
                  setSisaPiutang("");
                  setJatuhTempo("");
                  setSelectedDate(new Date());
                  setModeEdit(false);
                  setIdEdit(null);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.btnTutupText}>Tutup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnSimpan,
                  (isSaving || !formValid) && styles.btnDisabled,
                ]}
                onPress={simpanPiutang}
                disabled={isSaving || !formValid}
              >
                <Text style={styles.btnSimpanText}>
                  {modeEdit ? "Update" : "Simpan"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal bayar piutang */}
      <Modal visible={modalBayarVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Pembayaran Piutang</Text>

            <Text style={styles.detailLabel}>Nama Pelanggan</Text>
            <Text style={styles.detailValue}>{piutangDipilih?.nama}</Text>

            <Text style={styles.detailLabel}>Mobil</Text>
            <Text style={styles.detailValue}>{piutangDipilih?.mobil}</Text>

            <Text style={styles.detailLabel}>Jatuh Tempo</Text>
            <Text style={styles.detailValue}>{piutangDipilih?.jatuhTempo}</Text>

            <Text style={styles.detailLabel}>Sisa Piutang</Text>
            <Text style={styles.detailNominal}>
              Rp {piutangDipilih?.sisa?.toLocaleString("id-ID")}
            </Text>

            <TextInput
              ref={nominalBayarRef}
              style={styles.input}
              placeholder="Masukkan nominal pembayaran"
              value={formatRupiah(nominalBayar)}
              onChangeText={(text) =>
                setNominalBayar(text.replace(/[^0-9]/g, ""))
              }
              keyboardType="numeric"
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.btnTutup}
                onPress={() => {
                  setNominalBayar("");
                  setPiutangDipilih(null);
                  setModalBayarVisible(false);
                }}
              >
                <Text style={styles.btnTutupText}>Tutup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnSimpan,
                  (isProcessingPayment || nominalBayar.trim() === "") &&
                    styles.btnDisabled,
                ]}
                onPress={prosesPembayaran}
                disabled={isProcessingPayment || nominalBayar.trim() === ""}
              >
                <Text style={styles.btnSimpanText}>Bayar</Text>
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
    backgroundColor: "#7c3aed",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    color: "#ddd6fe",
    marginTop: 4,
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: "#7c3aed",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  heroTitle: {
    color: "#ddd6fe",
    fontSize: 13,
  },
  heroAmount: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 4,
  },
  heroSubtitle: {
    color: "#c4b5fd",
    marginTop: 6,
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7c3aed",
  },
  cardLabel: {
    marginTop: 4,
    color: "#6b7280",
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111827",
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 13,
  },
  piutangCard: {
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
  piutangCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  namaCustomer: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  namaMobil: {
    color: "#6b7280",
    marginTop: 2,
    fontSize: 13,
  },
  nominalPiutang: {
    color: "#dc2626",
    fontWeight: "bold",
    fontSize: 14,
  },
  jatuhTempo: {
    color: "#9ca3af",
    marginTop: 4,
    fontSize: 12,
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
  btnEdit: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnEditText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 11,
  },
  btnBayar: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnBayarText: {
    color: "#16a34a",
    fontWeight: "600",
    fontSize: 11,
  },
  btnHapus: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnHapusText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 11,
  },
  tombolTambah: {
    backgroundColor: "#7c3aed",
    margin: 16,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  tombolTambahText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  totalRiwayatCard: {
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  totalRiwayatLabel: {
    color: "#166534",
    fontSize: 13,
  },
  totalRiwayatNominal: {
    color: "#16a34a",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },
  riwayatCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
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
  riwayatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nominalBayarHistory: {
    color: "#16a34a",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111827",
  },
  input: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 14,
  },
  modalButtonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  btnTutup: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnTutupText: {
    color: "#6b7280",
    fontWeight: "600",
  },
  btnSimpan: {
    flex: 1,
    backgroundColor: "#7c3aed",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnSimpanText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  btnDisabled: {
    backgroundColor: "#9ca3af",
  },
  detailLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 10,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginTop: 2,
    marginBottom: 8,
  },
  detailNominal: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#dc2626",
    marginTop: 2,
    marginBottom: 16,
  },
});
