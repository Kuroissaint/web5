import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";
import axios from "axios";

const BASE_URL = 'http://192.168.100.16:3000';
const API_URL = `${BASE_URL}/api`;

const MyReportsPage = () => {
  const router = useRouter();
  const [myReports, setMyReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyReports = async () => {
    try {
      const deviceId = "mobile_device_meowment"; 
      const res = await axios.get(`${API_URL}/rescue?device_id=${deviceId}`);
      const data = res.data?.data || res.data || [];
      setMyReports(Array.isArray(data) ? [...data].reverse() : []);
    } catch (error) {
      console.error("Gagal ambil laporan saya:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyReports();
  };

  const handleDelete = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/rescue/${id}`);
    fetchMyReports(); // refresh list
  } catch (error) {
    console.error("Gagal hapus laporan:", error);
  }
};

// Gunakan 'diproses' (harus sama persis dengan yang dikirim dashboard)
  const statusSteps = [
    { key: 'dilaporkan', label: 'Dilaporkan', keterangan: 'Laporan diterima, menunggu tim shelter meninjau lokasi.' },
    { key: 'diproses', label: 'Diproses', keterangan: 'Laporan disetujui! Tim shelter dalam penanganan.' }, 
    { key: 'selesai', label: 'Selesai', keterangan: 'Laporan telah selesai ditangani, kucing sudah aman!' },
  ];

  const StatusShopeeStep = ({ status }: { status: string }) => {
    const currentStepIndex = statusSteps.findIndex(
      step => step.key === (status?.toLowerCase() || '')
    );

    return (
      <View style={styles.shopeeStepContainer}>
        {statusSteps.map((step, idx) => {
          const completed = idx <= currentStepIndex;
          const isLast = idx === statusSteps.length - 1;

          // LOGIKA WARNA CUSTOM
          let stepColor = "#ccc"; 
          if (completed) {
            if (step.key === 'dilaporkan') stepColor = "#e74c3c"; // Merah
            if (step.key === 'diproses') stepColor = "#f1c40f";   // Kuning
            if (step.key === 'selesai') stepColor = "#2ecc71";    // Hijau
          }

          return (
            <View key={step.key} style={styles.shopeeStepRow}>
              <View style={styles.shopeeStepCircleWrapper}>
                <View style={[styles.shopeeStepCircle, { backgroundColor: stepColor }]}>
                  <Text style={styles.shopeeStepNumber}>{idx + 1}</Text>
                </View>
                {!isLast && (
                  <View style={[styles.shopeeStepLine, { backgroundColor: completed ? stepColor : "#ccc" }]} />
                )}
              </View>

              <View style={styles.shopeeStepInfo}>
                <Text style={[styles.stepLabel, { color: completed ? stepColor : "#888" }]}>
                  {step.label}
                </Text>
                <Text style={[styles.stepDesc, { color: completed ? "#555" : "#aaa" }]}>
                  {step.keterangan}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const rawImage = item.gambar || item.url_gambar_utama;
    const imageUri = rawImage
      ? (rawImage.startsWith('http') 
          ? rawImage.replace('localhost', '192.168.100.16') 
          : `${BASE_URL}${rawImage}`)
      : "https://via.placeholder.com/300x200.png?text=No+Image";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.reportId}>Laporan #{item.id}</Text>
        </View>

        <Image source={{ uri: imageUri }} style={styles.image} />

        <View style={styles.infoContainer}>
          <InfoRow label="Pelapor" value={item.nama_pelapor} />
          <InfoRow label="Telepon" value={item.telepon} />
          <InfoRow label="Waktu" value={item.waktu_penemuan ? new Date(item.waktu_penemuan).toLocaleString('id-ID') : "-"} />
          <InfoRow label="Lokasi" value={item.lokasi_penemuan} />
          <InfoRow label="Tag" value={item.tags || item.nama_tag || "General"} />
          
          <View style={styles.descBox}>
            <Text style={styles.label}>Deskripsi:</Text>
            <Text style={styles.descText}>{item.deskripsi || "Tidak ada deskripsi."}</Text>
          </View>

          {/* Status ala Shopee */}
          <StatusShopeeStep status={item.status_display} />
          {/* Tombol hapus (hanya jika status masih dilaporkan) */}
{item.status_display?.toLowerCase() === 'dilaporkan' && (
  <TouchableOpacity
    style={styles.deleteBtn}
    onPress={() =>
      Alert.alert(
        "Hapus Laporan",
        "Yakin ingin menghapus laporan ini?",
        [
          { text: "Batal", style: "cancel" },
          { text: "Hapus", style: "destructive", onPress: () => handleDelete(item.id) }
        ]
      )
    }
  >
    <Ionicons name="trash-outline" size={18} color="#fff" />
    <Text style={styles.deleteText}>Hapus Laporan</Text>
  </TouchableOpacity>
)}

        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#9E7363" />
        </TouchableOpacity>
        <Text style={styles.title}>Riwayat Laporan Saya 🐾</Text>
        <View style={{ width: 40 }} /> 
      </View>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#9E7363" />
          <Text style={styles.loadingText}>Memuat riwayat...</Text>
        </View>
      ) : (
        <FlatList
          data={myReports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Kamu belum pernah mengirim laporan.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value }: { label: string, value: any }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{String(value || "-")}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3e0d2" },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  title: { 
    flex: 1,
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#9E7363", 
    textAlign: 'center'
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#9E7363' },
  listContent: { paddingHorizontal: 16, paddingBottom: 30 },
  card: { 
    backgroundColor: "#fff", 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 20, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardHeader: { marginBottom: 12 },
  reportId: { fontWeight: 'bold', color: '#888', fontSize: 13 },
  image: { width: "100%", height: 200, borderRadius: 15, marginBottom: 15 },
  infoContainer: { gap: 4 },
  infoRow: { flexDirection: 'row', paddingVertical: 3 },
  label: { width: 75, fontWeight: "bold", color: "#9E7363", fontSize: 13 },
  value: { flex: 1, color: "#444", fontSize: 13 },
  descBox: { marginTop: 8, backgroundColor: '#fdf8f5', padding: 10, borderRadius: 10 },
  descText: { fontSize: 12, color: '#666', fontStyle: 'italic' },
  empty: { marginTop: 100, alignItems: "center" },
  emptyText: { color: "#9E7363", fontSize: 15, fontWeight: 'bold' },
  deleteBtn: {
  marginTop: 15,
  backgroundColor: '#e74c3c',
  paddingVertical: 10,
  borderRadius: 10,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 6
},
deleteText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 13
},

  // Shopee Step Styles
  shopeeStepContainer: { marginTop: 15, marginBottom: 10 },
  shopeeStepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  shopeeStepCircleWrapper: { alignItems: 'center', width: 40 },
  shopeeStepCircle: { width: 25, height: 25, borderRadius: 12.5, justifyContent: 'center', alignItems: 'center' },
  shopeeStepNumber: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  shopeeStepLine: { width: 3, flex: 1, marginTop: 2 },
  stepDoneLine: { backgroundColor: '#2ecc71' },
  stepPendingLine: { backgroundColor: '#ccc' },
  stepDone: { backgroundColor: '#2ecc71' },
  stepPending: { backgroundColor: '#ccc' },
  shopeeStepInfo: { flex: 1, marginLeft: 10 },
  stepLabel: { fontWeight: 'bold', fontSize: 14 },
  stepDesc: { fontSize: 12, color: '#555', marginTop: 2 },
  stepDoneText: { color: '#2ecc71' },
  stepPendingText: { color: '#888' },
  stepDoneDesc: { color: '#555' },
  stepPendingDesc: { color: '#aaa' },
});

export default MyReportsPage;
