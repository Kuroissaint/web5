import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; 
import { getRescue } from "../services/api"; 
import DetailRescue from "../components/DetailRescue"; 
import { useFocusEffect } from '@react-navigation/native'; // Pastikan sudah install react-navigation

const RescuePage = () => {
  const router = useRouter();

  // State Data
  const [allReports, setAllReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userStatus, setUserStatus] = useState<'user' | 'shelter'>('user');
  const [userRole, setUserRole] = useState('user');

  // STATE UNTUK MODAL DETAIL
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUserStatus = async () => {
  try {
    // TAMBAHKAN /1 (atau ID user kamu) di akhir URL
    const response = await fetch("http://192.168.100.16:3000/api/cek-status/1"); 
    const result = await response.json();
    
    console.log("Data Status dari Server:", result); // Cek ini di terminal VSCode

    if (result.success && result.data) {
      // Pastikan backend mengirim kolom bernama 'status'
      setUserStatus(result.data.status); 
    }
  } catch (error) {
    console.log("Gagal ambil status user:", error);
  }
};

// Di dalam fungsi RescuePage
useFocusEffect(
  React.useCallback(() => {
    fetchAllReports(); // Fungsi buat ambil data dari API kamu
  }, [])
);

useEffect(() => {
  fetchAllReports();
  fetchUserStatus(); // Panggil saat halaman dibuka
}, []);

  const fetchAllReports = async () => {
    try {
      const data = await getRescue();
      setAllReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Gagal ambil laporan:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllReports();
  };

  const handleInternalChat = (item: any) => {
  // Gunakan ID Pengguna jika ada, jika tidak ada gunakan ID Laporan agar unik
  const finalId = item.pengguna_id || `rescue_${item.id}`; 
  const finalName = item.nama_pelapor || "Penyayang Kucing";

  console.log("Membuka chat untuk ID:", finalId);

  router.push({
    pathname: "/ChatRoom",
    params: { 
      userId: String(finalId), 
      userName: String(finalName) 
    }
  });
};

  const renderItem = ({ item }: { item: any }) => {
    const imageUri = item.gambar
      ? item.gambar.replace('localhost', '192.168.100.16')
      : "https://via.placeholder.com/300x200.png?text=No+Image";

    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUri }} style={styles.image} />

        <View style={styles.cardBody}>
          {/* BARIS STATUS */}
          <View style={styles.infoRow}>
            <Ionicons name="alert-circle-outline" size={18} color="#9E7363" />
            <Text style={styles.label}> Status:</Text>
            <Text style={styles.infoValue}> {item.status_display || "Pending"}</Text>
          </View>

          {/* BARIS LOKASI */}
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#9E7363" />
            <Text style={styles.label}> Lokasi: </Text>
            <Text style={styles.infoValue}>{item.lokasi_penemuan || "-"}</Text>
          </View>

          {/* BARIS TAG */}
          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={18} color="#9E7363" />
            <Text style={styles.label}> Tag:</Text>
            <Text style={styles.infoValue}> {item.nama_tag || item.tags || "General"}</Text>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => {
              setSelectedId(item.id);
              setModalVisible(true);
            }}
          >
            <Text style={styles.detailText}>Lihat Detail</Text>
          </TouchableOpacity>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => handleInternalChat(item)} // Kirim seluruh objek item
        >
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#9E7363" />
        </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* NAVIGASI ATAS */}
      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/FormRescue")}>
          <Text style={styles.actionText}>Kirim Laporan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/MyReportspage")}>
          <Text style={styles.actionText}>Laporan Anda</Text>
        </TouchableOpacity>
      </View>

      {/* AREA FITUR SHELTER (Daftar / Manajemen) */}
      <View style={styles.shelterArea}>
  {userStatus === 'user' ? (
    /* JIKA USER BIASA (BELUM DI-UPDATE ADMIN) -> TOMBOL COKELAT */
    <TouchableOpacity 
      style={styles.registerShelterBtn}
      onPress={() => router.push("/FormAjukanShelter")}
    >
      <Ionicons name="business-outline" size={20} color="#fff" style={{marginRight: 8}} />
      <Text style={styles.btnText}>Daftar Sebagai Mitra Shelter</Text>
    </TouchableOpacity>
  ) : (
    /* JIKA SUDAH JADI SHELTER (SUDAH DI-UPDATE ADMIN) -> TOMBOL IJO */
    <TouchableOpacity 
      style={styles.manageShelterBtn}
      onPress={() => router.push("/ShelterDashboard")}
    >
      <Ionicons name="shield-checkmark" size={20} color="#fff" />
      <Text style={styles.btnText}>Fitur Manajemen Shelter</Text>
    </TouchableOpacity>
  )}
</View>

      {/* TEKS PAHLAWAN (DI TENGAH) */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Update Kucing di Sekitarmu! 🐱</Text>
        <Text style={styles.welcomeSubtitle}>
          Temukan kabar terbaru tentang kucing yang membutuhkan bantuan. 
          Sudah siap jadi pahlawan hari ini?
        </Text>
      </View>

      {/* LIST POSTINGAN */}
      {loading ? (
        <ActivityIndicator size="large" color="#9E7363" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={allReports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 50 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <DetailRescue
        rescueId={selectedId}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default RescuePage;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3e0d2", padding: 16 },
  topButtons: { flexDirection: "row", gap: 10, marginBottom: 15 },
  actionButton: {
    flex: 1, backgroundColor: "#fff", padding: 15, borderRadius: 12, alignItems: "center", elevation: 2
  },
  actionText: { fontWeight: "bold", color: "#9E7363" },
  
  // STYLES FITUR SHELTER
  shelterArea: { marginBottom: 15 },
  registerShelterBtn: {
    backgroundColor: '#9E7363',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2
  },
  manageShelterBtn: {
    backgroundColor: '#4CAF50', 
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 2
  },
  btnText: { color: '#fff', fontWeight: 'bold' },

  welcomeSection: { 
    marginBottom: 20, 
    alignItems: 'center',
  },
  welcomeTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#444", 
    marginBottom: 6,
    textAlign: 'center'
  },
  welcomeSubtitle: { 
    fontSize: 14, 
    color: "#666", 
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 10
  },

  card: { backgroundColor: "#fff", borderRadius: 15, padding: 12, marginBottom: 16, elevation: 4 },
  image: { width: "100%", height: 180, borderRadius: 12, marginBottom: 12, backgroundColor: '#eee' },
  cardBody: { marginBottom: 12, gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555' },
  infoValue: { fontSize: 14, color: "#444" },

  buttonGroup: { flexDirection: 'row', gap: 10 },
  detailButton: { flex: 1, backgroundColor: "#9E7363", padding: 12, borderRadius: 10, alignItems: "center" },
  detailText: { color: "#fff", fontWeight: "bold" },
  chatButton: { 
    backgroundColor: "#f0f0f0", paddingHorizontal: 15, borderRadius: 10, 
    justifyContent: "center", alignItems: "center" 
  },
});