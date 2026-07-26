import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { COLORS, RADIUS } from "../utils/theme";

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const formatRupiah = (angka) => {
  return "Rp " + angka.toLocaleString("id-ID");
};

// Ubah tanggal ISO jadi kunci "Bulan Tahun", misal "Juli 2026"
const kunciBulan = (isoDate) => {
  const d = new Date(isoDate);
  return `${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
};

export default function LaporanScreen() {
  const [dataLaporan, setDataLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    muatLaporan();
  }, []);

  const muatLaporan = async () => {
    try {
      const [penjualanRes, stokRes] = await Promise.all([
        supabase.from("penjualan").select("harga, created_at"),
        supabase.from("stok_mobil").select("harga, created_at"),
      ]);

      if (penjualanRes.error) throw penjualanRes.error;
      if (stokRes.error) throw stokRes.error;

      // Kelompokkan per bulan
      const perBulan = {};

      penjualanRes.data.forEach((item) => {
        const bulan = kunciBulan(item.created_at);
        if (!perBulan[bulan])
          perBulan[bulan] = {
            bulan,
            pemasukan: 0,
            pengeluaran: 0,
            urutan: new Date(item.created_at),
          };
        perBulan[bulan].pemasukan += item.harga;
      });

      stokRes.data.forEach((item) => {
        const bulan = kunciBulan(item.created_at);
        if (!perBulan[bulan])
          perBulan[bulan] = {
            bulan,
            pemasukan: 0,
            pengeluaran: 0,
            urutan: new Date(item.created_at),
          };
        perBulan[bulan].pengeluaran += item.harga;
      });

      // Urutkan dari bulan terbaru ke terlama
      const hasil = Object.values(perBulan).sort((a, b) => b.urutan - a.urutan);

      setDataLaporan(hasil);
    } catch (error) {
      console.log("Error muat laporan:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPemasukan = dataLaporan.reduce(
    (total, d) => total + d.pemasukan,
    0,
  );
  const totalPengeluaran = dataLaporan.reduce(
    (total, d) => total + d.pengeluaran,
    0,
  );
  const totalKeuntungan = totalPemasukan - totalPengeluaran;

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerJudul}>Laporan Keuangan</Text>
        <Text style={styles.headerSub}>Rekap keseluruhan showroom</Text>
      </View>

      {/* Kartu ringkasan */}
      <View style={styles.kartuWrapper}>
        <View style={[styles.kartu, styles.kartuHijau]}>
          <Text style={styles.kartuLabel}>Total Pemasukan</Text>
          <Text style={styles.kartuNilai}>{formatRupiah(totalPemasukan)}</Text>
        </View>

        <View style={[styles.kartu, styles.kartuMerah]}>
          <Text style={styles.kartuLabel}>Total Pengeluaran</Text>
          <Text style={styles.kartuNilai}>
            {formatRupiah(totalPengeluaran)}
          </Text>
        </View>
      </View>

      {/* Kartu keuntungan */}
      <View style={styles.kartuKeuntungan}>
        <Text style={styles.keuntunganLabel}>Total Keuntungan Bersih</Text>
        <Text style={styles.keuntunganNilai}>
          {formatRupiah(totalKeuntungan)}
        </Text>
      </View>

      {/* Rekap bulanan */}
      <View style={styles.tabelWrapper}>
        <Text style={styles.tabelJudul}>Rekap Per Bulan</Text>

        {dataLaporan.length === 0 ? (
          <Text
            style={{
              color: COLORS.textSecondary,
              textAlign: "center",
              paddingVertical: 12,
            }}
          >
            Belum ada data
          </Text>
        ) : (
          dataLaporan.map((d, index) => (
            <View key={index} style={styles.kartuBulan}>
              <Text style={styles.namaBulan}>{d.bulan}</Text>
              <View style={styles.barisBulan}>
                <Text style={styles.labelBulan}>Pemasukan</Text>
                <Text style={styles.teksHijau}>
                  {formatRupiah(d.pemasukan)}
                </Text>
              </View>
              <View style={styles.barisBulan}>
                <Text style={styles.labelBulan}>Pengeluaran</Text>
                <Text style={styles.teksMerah}>
                  {formatRupiah(d.pengeluaran)}
                </Text>
              </View>
              <View style={styles.barisBulan}>
                <Text style={styles.labelBulan}>Keuntungan</Text>
                <Text style={styles.teksBiru}>
                  {formatRupiah(d.pemasukan - d.pengeluaran)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 24,
    paddingTop: 48,
  },
  headerJudul: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSub: {
    fontSize: 14,
    color: "#e6fff7",
    marginTop: 4,
  },
  kartuWrapper: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  kartu: {
    flex: 1,
    borderRadius: RADIUS.card,
    padding: 16,
  },
  kartuHijau: {
    backgroundColor: COLORS.tagBackground,
  },
  kartuMerah: {
    backgroundColor: "#fee2e2",
  },
  kartuLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  kartuNilai: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 4,
    color: COLORS.textPrimary,
  },
  kartuKeuntungan: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 16,
  },
  keuntunganLabel: {
    fontSize: 13,
    color: "#e6fff7",
  },
  keuntunganNilai: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 4,
  },
  tabelWrapper: {
    backgroundColor: COLORS.card,
    margin: 16,
    borderRadius: RADIUS.card,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tabelJudul: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: COLORS.textPrimary,
  },
  teksHijau: {
    color: "#16a34a",
  },
  teksMerah: {
    color: "#dc2626",
  },
  teksBiru: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  kartuBulan: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
    paddingVertical: 12,
  },
  namaBulan: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
  barisBulan: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  labelBulan: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
