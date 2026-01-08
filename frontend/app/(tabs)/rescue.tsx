import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  RefreshControl 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; 
import { getRescue, getUserData } from "../../services/api"; 
import DetailRescue from "../../components/DetailRescue"; 
import Navbar from "../../components/Navbar";
import { Colors } from "../../constants/Colors";
import { Layout } from "../../constants/Layout";
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../../services/api';

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

  const fetchUserStatus = async () => {
    try {
      const userData = await getUserData(); 
      if (userData && userData.id) {
        // PENTING: Sesuaikan IP_LAPTOP jika berubah di api.ts
        const response = await fetch(`http://192.168.0.108:3000/api/cek-status/${userData.id}`);
        const result = await response.json();
        if (result.success && result.data) {
          setUserStatus(result.data.status);
        }
      }
    } catch (error: any) {
      console.log("❌ Gagal cek status:", error.message);
    }
  };

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

  useFocusEffect(
    React.useCallback(() => {
      fetchAllReports();
      fetchUserStatus();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllReports();
  };

  const renderHeader = () => (
    <View style={styles.sectionPadding}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kucing Butuh Bantuan 🐱</Text>
        <Text style={styles.sectionSubtitle}>Daftar laporan penyelamatan terbaru di sekitarmu.</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const imageUri = item.url_gambar_utama
  ? (item.url_gambar_utama.startsWith('http') 
      ? item.url_gambar_utama.replace('localhost', '192.168.0.108') 
      : `${BASE_URL}${item.url_gambar_utama}`)
  : "https://via.placeholder.com/300x200.png?text=No+Image";
    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="alert-circle" size={16} color={Colors.primary} />
            <Text style={styles.statusLabel}> {item.status_display || "Pending"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.infoValue} numberOfLines={1}> {item.lokasi_penemuan || "-"}</Text>
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
            onPress={() => router.push({
              pathname: "/chat/[id]",
              params: { 
                userId: String(item.pengguna_id || 0), 
                userName: String(item.nama_pelapor || "Penyayang Kucing") 
              }
            })}
          >
            <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <Navbar /> 

      {/* HEADER GAYA SEARCHSCREEN */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Rescue Center 🏥</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              style={styles.btnCreate} 
              onPress={() => router.push("/form-rescue")}
            >
              <Ionicons name="megaphone-outline" size={14} color={Colors.white} />
              <Text style={styles.btnCreateText}>Lapor!</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnMyReport} 
              onPress={() => router.push("/my-report")}
            >
              <Text style={styles.btnMyReportText}>Laporan Saya</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tombol Status Shelter Terintegrasi */}
        <TouchableOpacity 
          style={[
            styles.shelterStatusBtn, 
            userStatus !== 'user' && { backgroundColor: Colors.success }
          ]}
          onPress={() => router.push(userStatus === 'user' ? "/form-shelter" : "/ShelterDashboard")}
        >
          <Ionicons 
            name={userStatus === 'user' ? "business-outline" : "shield-checkmark"} 
            size={18} 
            color={Colors.white} 
          />
          <Text style={styles.shelterStatusText}>
            {userStatus === 'user' ? "Daftar Mitra Shelter" : "Dashboard Shelter Aktif"}
          </Text>
        </TouchableOpacity>
      </View>

      <SafeAreaView style={styles.viewBg} edges={['bottom', 'left', 'right']}>
        {loading ? (
          <View style={styles.centerWrapper}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={allReports}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>

      <DetailRescue
        rescueId={selectedId}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.white },
  viewBg: { flex: 1, backgroundColor: "#FAFAFA" },
  
  // Header Putih dengan Shadow (Gaya SearchScreen)
  headerContainer: { 
    paddingHorizontal: 16, 
    paddingBottom: 16, 
    backgroundColor: Colors.white, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20, 
    ...Layout.shadow,
    zIndex: 99,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: Colors.primary },
  
  // Action Buttons di Header Row
  btnCreate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
    elevation: 2,
  },
  btnCreateText: { color: Colors.white, fontWeight: '800', fontSize: 10 },
  btnMyReport: {
    backgroundColor: '#FEF0E6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  btnMyReportText: { color: Colors.primary, fontWeight: '700', fontSize: 10 },

  // Shelter Status Button
  shelterStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  shelterStatusText: { color: Colors.white, fontWeight: '800', fontSize: 12 },

  // Content Styles
  sectionPadding: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: { marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  sectionSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  listContainer: { paddingBottom: 100 },
  
  // Card Style
  card: { 
    backgroundColor: Colors.white, 
    borderRadius: 20, 
    padding: 14, 
    marginBottom: 16, 
    marginHorizontal: 16, 
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee'
  },
  image: { width: "100%", height: 180, borderRadius: 15, marginBottom: 12, backgroundColor: '#f0f0f0' },
  cardBody: { marginBottom: 12, gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  statusLabel: { fontSize: 13, color: Colors.primary, fontWeight: '800' },
  infoValue: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

  buttonGroup: { flexDirection: 'row', gap: 10 },
  detailButton: { 
    flex: 1, 
    backgroundColor: Colors.primary, 
    padding: 14, 
    borderRadius: 12, 
    alignItems: "center" 
  },
  detailText: { color: Colors.white, fontWeight: "800", fontSize: 13 },
  chatButton: { 
    backgroundColor: '#FEF0E6', 
    paddingHorizontal: 18, 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: Colors.primary 
  },
  centerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default RescuePage;