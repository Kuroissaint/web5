import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Image
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getRescue, updateRescueStatus } from "../services/api";

const ShelterDashboard = () => {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'aktif' | 'selesai'>('aktif');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getRescue();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Error dashboard:", error);
      Alert.alert("Error", "Gagal memuat data laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (id: string, labelStatus: string, statusValue: string) => {
    try {
      setLoading(true);
      await updateRescueStatus(id, statusValue);
      Alert.alert("Berhasil", `Laporan kini berstatus: ${labelStatus}`);
      fetchReports();
    } catch (error) {
      Alert.alert("Gagal", "Gagal memperbarui database.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (id: string) => {
    Alert.alert(
      "Update Penanganan",
      "Pilih langkah selanjutnya:",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "📍 Proses (Sedang Ditangani)",
          onPress: () => handleUpdateStatus(id, "Proses", "diproses")
        },
        {
          text: "✅ Selesai (Sembuh/Adopsi)",
          onPress: () => handleUpdateStatus(id, "Selesai", "selesai")
        },
      ]
    );
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'dilaporkan': return { bg: '#FFE9E9', text: '#D32F2F', icon: 'time-outline' };
      case 'diproses': return { bg: '#FFF4E5', text: '#E65100', icon: 'construct-outline' };
      case 'selesai': return { bg: '#E8F5E9', text: '#2E7D32', icon: 'checkmark-circle-outline' };
      default: return { bg: '#F5F5F5', text: '#616161', icon: 'help-circle-outline' };
    }
  };

const renderItem = ({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status_display || 'dilaporkan');
    
    // --- PERBAIKAN URL GAMBAR ---
    const BASE_URL = 'http://192.168.100.16:3000'; // Pastikan IP ini sama dengan IP Server Laptop kamu
    let fotoUrl = 'https://via.placeholder.com/400x300.png?text=No+Image';

    if (item.gambar) {
      if (item.gambar.startsWith('http')) {
        // Jika dari DB sudah URL, ganti localhost ke IP agar bisa diakses HP
        fotoUrl = item.gambar.replace('localhost', '192.168.100.16').replace('127.0.0.1', '192.168.100.16');
      } else {
        // Jika hanya nama file (contoh: "foto123.jpg")
        fotoUrl = `${BASE_URL}/uploads/${item.gambar}`;
      }
    }

    return (
      <View style={styles.card}>
        {/* GAMBAR DENGAN FIXED HEIGHT */}
        <Image 
          source={{ uri: fotoUrl }} 
          style={styles.cardImage} 
          resizeMode="cover"
          // Tambahkan defaultSource untuk iOS jika ada
        />

        <View style={styles.cardContent}>
          {/* Header, Info, dan Footer tetap sama seperti sebelumnya */}
          <View style={styles.cardHeader}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.text} />
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {(item.status_display || "DILAPORKAN").toUpperCase()}
              </Text>
            </View>
            <Text style={styles.dateText}>{item.created_at || "Baru saja"}</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>PELAPOR</Text>
                <Text style={styles.valueText}>{item.nama_pelapor || "Anonim"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>NO. TELEPON</Text>
                <Text style={styles.valueText}>{item.telepon || "-"}</Text>
              </View>
            </View>
            
            <Text style={[styles.label, { marginTop: 12 }]}>LOKASI KEJADIAN</Text>
            <View style={styles.iconTextRow}>
              <Ionicons name="location-sharp" size={16} color="#4CAF50" />
              <Text style={styles.valueText}>{item.lokasi_penemuan || "Tidak ada lokasi"}</Text>
            </View>

            <Text style={[styles.label, { marginTop: 12 }]}>DESKRIPSI KONDISI</Text>
            <Text style={styles.descriptionText}>
              {item.deskripsi || "Tidak ada deskripsi tambahan."}
            </Text>
          </View>

          {filterStatus === 'aktif' && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.updateBtn} onPress={() => updateStatus(item.id)}>
                <Ionicons name="create-outline" size={18} color="#fff" />
                <Text style={styles.updateBtnText}>Update Penanganan</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Manajemen Shelter</Text>
          <Text style={styles.headerSubtitle}>Pantau dan tangani laporan rescue</Text>
        </View>
      </View>

      {/* FILTER TAB */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filterStatus === 'aktif' && styles.filterBtnActive]}
          onPress={() => setFilterStatus('aktif')}
        >
          <Text style={[styles.filterBtnText, filterStatus === 'aktif' && styles.filterBtnTextActive]}>
            Laporan Aktif ({reports.filter(r => r.status_display?.toLowerCase() !== 'selesai').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filterStatus === 'selesai' && styles.filterBtnActive]}
          onPress={() => setFilterStatus('selesai')}
        >
          <Text style={[styles.filterBtnText, filterStatus === 'selesai' && styles.filterBtnTextActive]}>
            Riwayat ({reports.filter(r => r.status_display?.toLowerCase() === 'selesai').length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Sinkronisasi data...</Text>
        </View>
      ) : (
        <FlatList
          data={reports.filter(item => {
            const status = item.status_display?.toLowerCase();
            return filterStatus === 'aktif' ? status !== 'selesai' : status === 'selesai';
          })}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name={filterStatus === 'aktif' ? "happy-outline" : "archive-outline"}
                size={80} color="#DDD"
              />
              <Text style={styles.emptyText}>
                {filterStatus === 'aktif'
                  ? "Semua aman! Tidak ada laporan aktif saat ini."
                  : "Belum ada riwayat laporan yang diselesaikan."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },
  header: { 
    backgroundColor: "#4CAF50", 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    paddingBottom: 40, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: { marginRight: 15, backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 15 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  headerSubtitle: { color: "#C8E6C9", fontSize: 14 },
  
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 25,
    marginTop: -25,
    borderRadius: 20,
    paddingVertical: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 11, color: '#999', marginTop: 4, fontWeight: '600' },

  card: { 
    backgroundColor: "#fff", 
    borderRadius: 20, 
    marginBottom: 20, 
    overflow: 'hidden', // Agar gambar mengikuti radius kartu
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 200, // Ukuran foto di dashboard
    backgroundColor: '#EEE',
  },
  cardContent: {
    padding: 20, // Padding untuk teks di bawah gambar
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 5 },
  statusText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  dateText: { fontSize: 11, color: '#AAA' },
  
  infoSection: { marginBottom: 15 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#BBB', letterSpacing: 1, marginBottom: 4 },
  valueText: { fontSize: 15, color: '#333', fontWeight: '500' },
  iconTextRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  
  rowInfo: { flexDirection: 'row', marginTop: 10 },
  tagBadge: { alignSelf: 'flex-start', backgroundColor: '#F0F7F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 2 },
  tagText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  
  descriptionText: { fontSize: 13, color: '#666', lineHeight: 20, backgroundColor: '#F9F9F9', padding: 10, borderRadius: 10, marginTop: 5 },

  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 15 },
  
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20, // Tambahkan ini agar tidak mepet kotak statistik
    marginBottom: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },

  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  filterBtnActive: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  filterBtnText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  filterBtnTextActive: {
    color: '#4CAF50',
  },
  updateBtn: { 
    backgroundColor: "#4CAF50", 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 12, 
    borderRadius: 12,
    gap: 8,
    elevation: 3,
  },
  updateBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#999', fontSize: 13 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#AAA', marginTop: 15, fontSize: 14, textAlign: 'center' }
});

export default ShelterDashboard;