import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
  RefreshControl
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { rescueAPI } from "../services/api"; //

const ShelterDashboard = () => {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fungsi mengambil semua laporan rescue untuk dikelola
  const fetchReports = async () => {
    try {
      const response = await rescueAPI.getAll(); //
      const data = response.data?.data || response.data || [];
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Gagal mengambil laporan dashboard:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  // Fungsi update status laporan (dilaporkan -> diproses -> selesai)
  const handleUpdateStatus = async (id: string | number, newStatus: string) => {
    try {
      await rescueAPI.updateStatus(id, newStatus); //
      Alert.alert("Berhasil", `Laporan kini berstatus: ${newStatus}`);
      fetchReports(); // Refresh data setelah update
    } catch (e) {
      Alert.alert("Gagal", "Gagal memperbarui status laporan.");
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    // Penanganan URL Gambar agar muncul di HP (Ganti localhost ke IP laptop)
    const rawImage = item.gambar || item.url_gambar_utama;
    const imageUri = rawImage
      ? (rawImage.startsWith('http') ? rawImage.replace('localhost', '192.168.64.217') : `http://192.168.64.217:3000${rawImage}`)
      : "https://via.placeholder.com/300x200.png?text=No+Image";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.reportId}>ID Laporan: #{item.id}</Text>
          <View style={[styles.statusBadge, styles[item.status_display?.toLowerCase() || 'dilaporkan']]}>
            <Text style={styles.statusBadgeText}>{item.status_display || "Pending"}</Text>
          </View>
        </View>

        <Image source={{ uri: imageUri }} style={styles.image} />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}><Text style={styles.bold}>Pelapor:</Text> {item.nama_pelapor}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Lokasi:</Text> {item.lokasi_penemuan}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Kategori:</Text> {item.tags || "Umum"}</Text>
        </View>

        {/* Tombol Aksi untuk Shelter */}
        <View style={styles.actionRow}>
          {item.status_display?.toLowerCase() === 'dilaporkan' && (
            <TouchableOpacity 
              style={[styles.btnAction, { backgroundColor: '#f1c40f' }]} 
              onPress={() => handleUpdateStatus(item.id, 'diproses')}
            >
              <Ionicons name="play-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Proses</Text>
            </TouchableOpacity>
          )}
          
          {item.status_display?.toLowerCase() === 'diproses' && (
            <TouchableOpacity 
              style={[styles.btnAction, { backgroundColor: '#2ecc71' }]} 
              onPress={() => handleUpdateStatus(item.id, 'selesai')}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Selesaikan</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.btnDetail} 
            onPress={() => router.push({ pathname: "/my-report", params: { id: item.id } })}
          >
            <Text style={styles.btnTextDetail}>Detail</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header disamakan dengan my-report.tsx */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FF8C00" />
        </TouchableOpacity>
        <Text style={styles.title}>Panel Shelter 🛡️</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF8C00" />
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Tidak ada laporan rescue aktif.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF5E6" },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', elevation: 2 },
  backBtn: { padding: 8, borderRadius: 10, backgroundColor: '#FFF3E0' },
  title: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#FF8C00', textAlign: 'center' },
  listContent: { padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 20, marginBottom: 16, padding: 15, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  reportId: { fontSize: 12, color: '#888', fontWeight: 'bold' },
  image: { width: "100%", height: 180, borderRadius: 15, marginBottom: 12 },
  infoBox: { marginBottom: 15 },
  infoText: { fontSize: 14, color: '#444', marginBottom: 4 },
  bold: { fontWeight: 'bold', color: '#FF8C00' },
  actionRow: { flexDirection: 'row', gap: 10 },
  btnAction: { flex: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 12, gap: 6 },
  btnDetail: { flex: 1, borderColor: '#FF8C00', borderWidth: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  btnTextDetail: { color: '#FF8C00', fontWeight: 'bold', fontSize: 13 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  statusBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  dilaporkan: { backgroundColor: '#e74c3c' },
  diproses: { backgroundColor: '#f1c40f' },
  selesai: { backgroundColor: '#2ecc71' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#FF8C00', fontWeight: 'bold' }
});

export default ShelterDashboard;