import { tambahAktivitas } from "../utils/aktivitas";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";

const formatRupiah = (angka) => {
  return "Rp " + angka.toLocaleString("id-ID");
};

export default function PenjualanScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modeEdit, setModeEdit] = useState(false);
  const [idEdit, setIdEdit] = useState(null);
  const [namaMobil, setNamaMobil] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [tanggalJual, setTanggalJual] = useState("");
  const [dataPenjualan, setDataPenjualan] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusTransaksi, setStatusTransaksi] = useState("Lunas");
  const [nominalDP, setNominalDP] = useState("");
  const [modalBayarVisible, setModalBayarVisible] = useState(false);
  const [penjualanDipilih, setPenjualanDipilih] = useState(null);
  const [nominalBayar, setNominalBayar] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    bacaDataPenjualan();
  }, []);

  const bacaDataPenjualan = async () => {
    try {
      const { data, error } = await supabase
        .from("penjualan")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      setDataPenjualan(data);
    } catch (error) {
      console.log("Error baca penjualan:", error.message);
      Alert.alert("Gagal", "Tidak bisa memuat data penjualan.");
    }
  };

  const totalOmset = dataPenjualan.reduce(
    (total, item) => total + item.harga,
    0,
  );

  const simpanPenjualan = async () => {
    if (!namaMobil || !hargaJual || !tanggalJual) {
      Alert.alert("Peringatan", "Semua field wajib diisi.");
      return;
    }

    if (!/^\d+$/.test(hargaJual)) {
      Alert.alert("Peringatan", "Harga jual hanya boleh berisi angka.");
      return;
    }

    const hargaBaru = parseInt(hargaJual, 10);

    if (!Number.isFinite(hargaBaru) || hargaBaru <= 0) {
      Alert.alert("Peringatan", "Harga jual harus berupa angka lebih dari 0.");
      return;
    }

    let dataBaru = [];

    try {
      if (modeEdit) {
        const { data, error } = await supabase
          .from("penjualan")
          .update({
            mobil: namaMobil,
            harga: hargaBaru,
            tanggal: tanggalJual,
          })
          .eq("id", idEdit)
          .select()
          .single();

        if (error) throw error;

        setDataPenjualan((prev) =>
          prev.map((item) => (item.id === idEdit ? data : item)),
        );

        await tambahAktivitas(`✏️ Penjualan ${namaMobil} diperbarui`);
      } else {
        let sisaBaru = 0;

        if (statusTransaksi === "DP") {
          if (!/^\d+$/.test(nominalDP)) {
            Alert.alert("Peringatan", "Nominal DP hanya boleh berisi angka.");
            return;
          }

          const dpBaru = parseInt(nominalDP, 10);

          if (!dpBaru || dpBaru <= 0 || dpBaru >= hargaBaru) {
            Alert.alert(
              "Peringatan",
              "Nominal DP harus lebih dari 0 dan kurang dari harga jual.",
            );
            return;
          }

          sisaBaru = hargaBaru - dpBaru;
        }

        const { data, error } = await supabase
          .from("penjualan")
          .insert({
            mobil: namaMobil,
            harga: hargaBaru,
            tanggal: tanggalJual,
            status: statusTransaksi,
            sisa: sisaBaru,
          })
          .select()
          .single();

        if (error) throw error;

        setDataPenjualan((prev) => [data, ...prev]);

        await tambahAktivitas(
          statusTransaksi === "DP"
            ? `📝 ${namaMobil} terjual dengan DP`
            : `💰 ${namaMobil} berhasil terjual`,
        );
      }
    } catch (error) {
      console.log("Error simpan penjualan:", error.message);
      Alert.alert("Gagal", "Tidak bisa menyimpan data penjualan.");
      return;
    }

    setNamaMobil("");
    setHargaJual("");
    setTanggalJual("");

    setModeEdit(false);
    setIdEdit(null);

    setSelectedDate(new Date());
    setStatusTransaksi("Lunas");
    setNominalDP("");

    setModalVisible(false);
  };

  const hapusPenjualan = (id) => {
    Alert.alert("Hapus Penjualan", "Yakin ingin menghapus data ini?", [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("penjualan")
              .delete()
              .eq("id", id);

            if (error) throw error;

            setDataPenjualan((prev) => prev.filter((item) => item.id !== id));
          } catch (error) {
            console.log("Error hapus penjualan:", error.message);
            Alert.alert("Gagal", "Tidak bisa menghapus data.");
          }
        },
      },
    ]);
  };

  const prosesPembayaranDP = () => {
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

    if (!penjualanDipilih) {
      Alert.alert("Peringatan", "Pilih transaksi terlebih dahulu.");
      return;
    }

    if (bayar > Number(penjualanDipilih.sisa)) {
      Alert.alert("Peringatan", "Nominal pembayaran melebihi sisa DP.");
      return;
    }

    Alert.alert(
      "Konfirmasi Pembayaran",
      `Terima pembayaran Rp ${bayar.toLocaleString("id-ID")}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Bayar",
          onPress: async () => {
            if (isProcessingPayment) return;
            setIsProcessingPayment(true);

            const sisaBaru = Number(penjualanDipilih.sisa) - bayar;
            const lunas = sisaBaru <= 0;

            try {
              const { data, error } = await supabase
                .from("penjualan")
                .update({
                  sisa: lunas ? 0 : sisaBaru,
                  status: lunas ? "Lunas" : "DP",
                })
                .eq("id", penjualanDipilih.id)
                .select()
                .single();

              if (error) throw error;

              setDataPenjualan((prev) =>
                prev.map((item) =>
                  item.id === penjualanDipilih.id ? data : item,
                ),
              );

              await tambahAktivitas(
                lunas
                  ? `✅ ${penjualanDipilih.mobil} lunas terbayar`
                  : `💰 Pembayaran DP ${penjualanDipilih.mobil} diterima`,
              );
            } catch (error) {
              console.log("Error proses pembayaran:", error.message);
              Alert.alert("Gagal", "Tidak bisa memproses pembayaran.");
            } finally {
              setIsProcessingPayment(false);
              setModalBayarVisible(false);
              setNominalBayar("");
              setPenjualanDipilih(null);
            }
          },
        },
      ],
    );
  };

  const cetakKwitansi = async (item) => {
    const html = `
            <html>
                <body style="font-family: Helvetica; padding: 24px;">
                    <h2 style="text-align:center; margin-bottom: 4px;">KWITANSI PENJUALAN</h2>
                    <p style="text-align:center; color:#666; margin-top:0;">AutoShowroom</p>
                    <hr />
                    <table style="width:100%; margin-top:16px; font-size:14px;">
                        <tr>
                            <td style="padding:6px 0;">Nama Mobil</td>
                            <td style="padding:6px 0; text-align:right;"><b>${item.mobil}</b></td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;">Tanggal Transaksi</td>
                            <td style="padding:6px 0; text-align:right;">${item.tanggal}</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;">Harga Jual</td>
                            <td style="padding:6px 0; text-align:right;">${formatRupiah(item.harga)}</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;">Status</td>
                            <td style="padding:6px 0; text-align:right;"><b>${item.status}</b></td>
                        </tr>
                        ${
                          item.status === "DP"
                            ? `
                        <tr>
                            <td style="padding:6px 0;">Sisa Pembayaran</td>
                            <td style="padding:6px 0; text-align:right; color:#dc2626;">${formatRupiah(item.sisa || 0)}</td>
                        </tr>
                        `
                            : ""
                        }
                    </table>
                    <hr style="margin-top:24px;" />
                    <p style="text-align:center; color:#999; font-size:12px; margin-top:24px;">
                        Kwitansi ini dicetak otomatis oleh AutoShowroom
                    </p>
                </body>
            </html>
        `;

    try {
      const { uri } = await Print.printToFileAsync({ html });

      const bisaShare = await Sharing.isAvailableAsync();

      if (bisaShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Kwitansi - ${item.mobil}`,
        });
      } else {
        Alert.alert("Info", "Fitur berbagi tidak tersedia di perangkat ini.");
      }
    } catch (error) {
      console.log("Error cetak kwitansi:", error);
      Alert.alert("Gagal", "Terjadi kesalahan saat membuat kwitansi.");
    }
  };

  const pilihTanggal = (event, date) => {
    setShowDatePicker(false);

    if (!date) {
      return;
    }

    setSelectedDate(date);

    const tanggalFormat = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    setTanggalJual(tanggalFormat);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Penjualan</Text>
        <Text style={styles.subtitle}>Ringkasan transaksi showroom</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero omset */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Omset Bulan Ini</Text>
          <Text style={styles.heroAmount}>{formatRupiah(totalOmset)}</Text>
          <Text style={styles.heroSubtitle}>
            Dari {dataPenjualan.length} transaksi
          </Text>
        </View>

        {/* Statistik */}
        <View style={styles.statsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{dataPenjualan.length}</Text>
            <Text style={styles.cardLabel}>Unit Terjual</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{formatRupiah(totalOmset)}</Text>
            <Text style={styles.cardLabel}>Total Omset</Text>
          </View>
        </View>

        {/* Riwayat penjualan */}
        <Text style={styles.sectionTitle}>Riwayat Penjualan</Text>

        {dataPenjualan.map((item) => (
          <View key={item.id} style={styles.saleCard}>
            {/* Baris atas: nama + badge status */}
            <View style={styles.saleCardHeader}>
              <Text style={styles.carName}>{item.mobil}</Text>
              <View
                style={
                  item.status === "Lunas" ? styles.badgeLunas : styles.badgeDP
                }
              >
                <Text
                  style={
                    item.status === "Lunas"
                      ? styles.badgeLunasTeks
                      : styles.badgeDPTeks
                  }
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={styles.price}>{formatRupiah(item.harga)}</Text>
            <Text style={styles.date}>{item.tanggal}</Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Tombol aksi */}
            <View style={styles.tombolWrapper}>
              <TouchableOpacity
                style={styles.btnEdit}
                onPress={() => {
                  setModeEdit(true);
                  setIdEdit(item.id);
                  setNamaMobil(item.mobil);
                  setHargaJual(item.harga.toString());
                  setTanggalJual(item.tanggal);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.btnEditText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnHapus}
                onPress={() => hapusPenjualan(item.id)}
              >
                <Text style={styles.btnHapusText}>Hapus</Text>
              </TouchableOpacity>

              {item.status === "DP" && (
                <TouchableOpacity
                  style={styles.btnLunasi}
                  onPress={() => {
                    setPenjualanDipilih(item);
                    setNominalBayar("");
                    setModalBayarVisible(true);
                  }}
                >
                  <Text style={styles.btnLunasiText}>Lunasi</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.btnKwitansi}
                onPress={() => cetakKwitansi(item)}
              >
                <Text style={styles.btnKwitansiText}>Kwitansi</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Tombol tambah */}
      <TouchableOpacity
        style={styles.tombolTambah}
        onPress={() => {
          setModeEdit(false);
          setIdEdit(null);
          setNamaMobil("");
          setHargaJual("");
          setTanggalJual("");
          setSelectedDate(new Date());
          setModalVisible(true);
        }}
      >
        <Text style={styles.tombolTambahTeks}>+ Tambah Penjualan</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {modeEdit ? "Edit Penjualan" : "Tambah Penjualan"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nama Mobil"
              value={namaMobil}
              onChangeText={setNamaMobil}
            />

            <TextInput
              style={styles.input}
              placeholder="Harga Jual"
              value={hargaJual}
              onChangeText={setHargaJual}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: tanggalJual ? "#111827" : "#9ca3af" }}>
                {tanggalJual || "Pilih Tanggal"}
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

            {!modeEdit && (
              <>
                <View style={styles.statusToggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.statusToggleBtn,
                      statusTransaksi === "Lunas" &&
                        styles.statusToggleBtnAktif,
                    ]}
                    onPress={() => {
                      setStatusTransaksi("Lunas");
                      setNominalDP("");
                    }}
                  >
                    <Text
                      style={
                        statusTransaksi === "Lunas"
                          ? styles.statusToggleTextAktif
                          : styles.statusToggleText
                      }
                    >
                      Lunas
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusToggleBtn,
                      statusTransaksi === "DP" && styles.statusToggleBtnAktif,
                    ]}
                    onPress={() => setStatusTransaksi("DP")}
                  >
                    <Text
                      style={
                        statusTransaksi === "DP"
                          ? styles.statusToggleTextAktif
                          : styles.statusToggleText
                      }
                    >
                      DP
                    </Text>
                  </TouchableOpacity>
                </View>

                {statusTransaksi === "DP" && (
                  <TextInput
                    style={styles.input}
                    placeholder="Nominal DP"
                    value={nominalDP}
                    onChangeText={setNominalDP}
                    keyboardType="numeric"
                  />
                )}
              </>
            )}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.btnBatal}
                onPress={() => {
                  setNamaMobil("");
                  setHargaJual("");
                  setTanggalJual("");

                  setModeEdit(false);
                  setIdEdit(null);

                  setSelectedDate(new Date());
                  setStatusTransaksi("Lunas");
                  setNominalDP("");

                  setModalVisible(false);
                }}
              >
                <Text style={styles.btnBatalText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnSimpan}
                onPress={simpanPenjualan}
              >
                <Text style={styles.btnSimpanText}>
                  {modeEdit ? "Update" : "Simpan"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal pelunasan DP */}
      <Modal visible={modalBayarVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Pelunasan DP</Text>

            <Text style={styles.detailLabel}>Mobil</Text>
            <Text style={styles.detailValue}>{penjualanDipilih?.mobil}</Text>

            <Text style={styles.detailLabel}>Sisa DP</Text>
            <Text style={styles.detailNominal}>
              {formatRupiah(penjualanDipilih?.sisa || 0)}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Masukkan nominal pembayaran"
              value={nominalBayar}
              onChangeText={(text) =>
                setNominalBayar(text.replace(/[^0-9]/g, ""))
              }
              keyboardType="numeric"
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.btnBatal}
                onPress={() => {
                  setNominalBayar("");
                  setPenjualanDipilih(null);
                  setModalBayarVisible(false);
                }}
              >
                <Text style={styles.btnBatalText}>Tutup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnSimpan}
                onPress={prosesPembayaranDP}
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
    backgroundColor: "#2563eb",
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
    color: "#bfdbfe",
    marginTop: 4,
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: "#2563eb",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  heroTitle: {
    color: "#bfdbfe",
    fontSize: 13,
  },
  heroAmount: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 4,
  },
  heroSubtitle: {
    color: "#93c5fd",
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
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
  saleCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#7c3aed",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  saleCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  carName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  price: {
    color: "#2563eb",
    marginTop: 4,
    fontWeight: "700",
    fontSize: 14,
  },
  date: {
    color: "#6b7280",
    marginTop: 4,
    fontSize: 12,
  },
  badgeLunas: {
    backgroundColor: "#dcfce7",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeLunasTeks: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16a34a",
  },
  badgeDP: {
    backgroundColor: "#fef3c7",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeDPTeks: {
    fontSize: 11,
    fontWeight: "600",
    color: "#d97706",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 12,
  },
  tombolWrapper: {
    flexDirection: "row",
    gap: 8,
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
  btnBatal: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnBatalText: {
    color: "#6b7280",
    fontWeight: "600",
  },
  btnSimpan: {
    flex: 1,
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnSimpanText: {
    color: "#fff",
    fontWeight: "bold",
  },
  btnLunasi: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnLunasiText: {
    color: "#16a34a",
    fontWeight: "600",
    fontSize: 11,
  },
  statusToggleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statusToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  statusToggleBtnAktif: {
    backgroundColor: "#2563eb",
  },
  statusToggleText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 13,
  },
  statusToggleTextAktif: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
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
  btnKwitansi: {
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnKwitansiText: {
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: 11,
  },
});
