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
import { getRescue } from "../../services/api"; // Sesuaikan path ke api.ts kamu
import DetailRescue from "../../components/DetailRescue"; // Pastikan file komponen ini sudah ada
import { useFocusEffect } from '@react-navigation/native';

const RescuePage = () => {
  const router = useRouter();

  // State Data
  const [allReports, setAllReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userStatus, setUserStatus] = useState<'user' | 'shelter'>('user');

  // State Modal Detail
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Ambil Status User (untuk menentukan tombol daftar shelter)
  const fetchUserStatus = async () => {
    try {
      // Endpoint ini harus ada di backend kamu untuk cek role/status user
      const response = await fetch("http://192.168.1.3:3000/api/cek-status/1"); 
      const result = await response.json();

      if (result.success && result.data) {
        setUserStatus(result.data.status); 
      }
    } catch (error) {
      console.log("Gagal ambil status user:", error);
    }
  };

  // Refresh data setiap kali user masuk ke tab ini
  useFocusEffect(
    React.useCallback(() => {
      fetchAllReports();
    }, [])
  );

  useEffect(() => {
    fetchAllReports();
    fetchUserStatus();
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllReports();
  };

  const handleInternalChat = (item: any) => {
    // Menggunakan pengguna_id sesuai database kamu
    const finalId = item.pengguna_id || `rescue_${item.id}`; 
    const finalName = item.nama_pelapor || "Penyayang Kucing";

    router.push({
      pathname: "/chat/[id]", // Disesuaikan dengan struktur folder chat kamu
      params: { 
        userId: String(finalId), 
        userName: String(finalName) 
      }
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    // Penyesuaian IP localhost ke IP Lokal agar gambar muncul di HP
    const imageUri = item.url_gambar_utama
      ? item.url_gambar_utama.replace('localhost', '192.168.100.16')
      : "https://via.placeholder.com/300x200.png?text=No+Image";

    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUri }} style={styles.image} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="alert-circle-outline" size={18} color="#FF8C00" />
            <Text style={styles.label}> Status:</Text>
            <Text style={styles.infoValue}> {item.status_display || "Pending"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#FF8C00" />
            <Text style={styles.label}> Lokasi: </Text>
            <Text style={styles.infoValue}>{item.lokasi_penemuan || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={18} color="#FF8C00" />
            <Text style={styles.label}> Tag:</Text>
            <Text style={styles.infoValue}> {item.tags || "General"}</Text>
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
            onPress={() => handleInternalChat(item)}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FF8C00" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tombol Navigasi Atas */}
      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/form-recue")}>
          <Text style={styles.actionText}>Kirim Laporan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/MyReportspage")}>
          <Text style={styles.actionText}>Laporan Anda</Text>
        </TouchableOpacity>
      </View>

      {/* Tombol Shelter */}
      <View style={styles.shelterArea}>
        {userStatus === 'user' ? (
          <TouchableOpacity 
            style={styles.registerShelterBtn}
            onPress={() => router.push("/form-shelter")}
          >
            <Ionicons name="business-outline" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.btnText}>Daftar Mitra Shelter</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.manageShelterBtn}
            onPress={() => router.push("/ShelterDashboard")}
          >
            <Ionicons name="shield-checkmark" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.btnText}>Dashboard Shelter</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Update Kucing Rescue 🐱</Text>
        <Text style={styles.welcomeSubtitle}>
          Temukan kabar terbaru kucing yang butuh pertolongan segera.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF8C00" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={allReports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
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
  container: { flex: 1, backgroundColor: "#FFF5E6", padding: 16 },
  topButtons: { flexDirection: "row", gap: 10, marginBottom: 15 },
  actionButton: {
    flex: 1, backgroundColor: "#fff", padding: 15, borderRadius: 12, alignItems: "center", elevation: 2, borderWidth: 1, borderColor: '#FFE0B2'
  },
  actionText: { fontWeight: "bold", color: "#FF8C00" },
  
  shelterArea: { marginBottom: 15 },
  registerShelterBtn: {
    backgroundColor: '#FF8C00',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3
  },
  manageShelterBtn: {
    backgroundColor: '#4CAF50', 
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3
  },
  btnText: { color: '#fff', fontWeight: 'bold' },

  welcomeSection: { marginBottom: 20, alignItems: 'center' },
  welcomeTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 6 },
  welcomeSubtitle: { fontSize: 14, color: "#666", textAlign: 'center' },

  card: { backgroundColor: "#fff", borderRadius: 15, padding: 12, marginBottom: 16, elevation: 4 },
  image: { width: "100%", height: 180, borderRadius: 12, marginBottom: 12, backgroundColor: '#f0f0f0' },
  cardBody: { marginBottom: 12, gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555' },
  infoValue: { fontSize: 14, color: "#444" },

  buttonGroup: { flexDirection: 'row', gap: 10 },
  detailButton: { flex: 1, backgroundColor: "#FF8C00", padding: 12, borderRadius: 10, alignItems: "center" },
  detailText: { color: "#fff", fontWeight: "bold" },
  chatButton: { 
    backgroundColor: "#FFF3E0", paddingHorizontal: 15, borderRadius: 10, 
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: '#FFE0B2'
  },
});