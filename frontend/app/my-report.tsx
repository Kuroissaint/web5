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
  SafeAreaView,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pastikan IP ini sesuai dengan IP server laptop kamu
const BASE_URL = 'http://192.168.0.108:3000';
const API_URL = `${BASE_URL}/api`;

const MyReportPage = () => {
  const router = useRouter();
  const [myReports, setMyReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyReports = async () => {
    setLoading(true); // Pastikan loading dimulai
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        
        // Gunakan instance 'api' agar interceptor token ikut terkirim
        const res = await api.get(`/rescue?pengguna_id=${user.id}`); 
        
        if (res.data.success) {
          setMyReports(res.data.data);
        }
      }
    } catch (err) {
      console.error("Gagal ambil laporan saya:", err);
    } finally {
      setLoading(false);    
      setRefreshing(false); // Menghentikan animasi tarik-untuk-refresh
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
      // Gunakan 'api' bukan 'axios' agar token otomatis terlampir
      await api.delete(`/rescue/${id}`); 
      Alert.alert("Sukses", "Laporan berhasil dibatalkan.");
      fetchMyReports(); 
    } catch (error) {
      console.error("Error delete:", error);
      Alert.alert("Gagal", "Gagal menghapus laporan.");
    }
  };

  const statusSteps = [
    { key: 'dilaporkan', label: 'Dilaporkan', keterangan: 'Laporan diterima, menunggu tim shelter meninjau lokasi.' },
    { key: 'diproses', label: 'Diproses', keterangan: 'Laporan disetujui! Tim shelter dalam penanganan.' }, 
    { key: 'selesai', label: 'Selesai', keterangan: 'Laporan telah selesai ditangani, kucing sudah aman!' },
  ];

  const StatusTracker = ({ status }: { status: string }) => {
    const currentStepIndex = statusSteps.findIndex(
      step => step.key === (status?.toLowerCase() || '')
    );

    return (
      <View style={styles.shopeeStepContainer}>
        {statusSteps.map((step, idx) => {
          const completed = idx <= currentStepIndex;
          const isLast = idx === statusSteps.length - 1;

          let stepColor = "#ccc"; 
          if (completed) {
            if (step.key === 'dilaporkan') stepColor = "#e74c3c"; // Merah
            if (step.key === 'diproses') stepColor = "#f1c40f";   // Kuning (Diproses)
            if (step.key === 'selesai') stepColor = "#2ecc71";    // Hijau (Selesai)
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
          ? rawImage.replace('localhost', '192.168.0.108') 
          : `${BASE_URL}${rawImage}`)
      : "https://via.placeholder.com/300x200.png?text=No+Image";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.reportId}>Laporan #{item.id}</Text>
        </View>

        <Image source={{ uri: imageUri }} style={styles.image} />

        <View style={styles.infoContainer}>
          <InfoRow label="Waktu" value={item.waktu_penemuan ? new Date(item.waktu_penemuan).toLocaleString('id-ID') : "-"} />
          <InfoRow label="Lokasi" value={item.lokasi_penemuan} />
          <InfoRow label="Tag" value={item.tags || item.nama_tag || "General"} />
          
          <View style={styles.descBox}>
            <Text style={styles.label}>Deskripsi:</Text>
            <Text style={styles.descText}>{item.deskripsi || "Tidak ada deskripsi."}</Text>
          </View>

          <StatusTracker status={item.status_display} />
          
          {item.status_display?.toLowerCase() === 'dilaporkan' && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() =>
                Alert.alert(
                  "Hapus Laporan",
                  "Yakin ingin membatalkan laporan ini?",
                  [
                    { text: "Batal", style: "cancel" },
                    { text: "Ya, Hapus", style: "destructive", onPress: () => handleDelete(item.id) }
                  ]
                )
              }
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={styles.deleteText}>Batalkan Laporan</Text>
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
        >
          <Ionicons name="arrow-back" size={24} color="#FF8C00" />
        </TouchableOpacity>
        <Text style={styles.title}>Laporan Saya 🐾</Text>
        <View style={{ width: 40 }} /> 
      </View>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF8C00" />
        </View>
      ) : (
        <FlatList
          data={myReports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Belum ada laporan yang kamu kirim.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value }: { label: string, value: any }) => (
  <View style={styles.infoRow}>
    <Text style={styles.boldLabel}>{label}:</Text>
    <Text style={styles.valueText}>{String(value || "-")}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF5E6" },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  backButton: { width: 40, height: 40, backgroundColor: '#FFF3E0', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  title: { flex: 1, fontSize: 20, fontWeight: "bold", color: "#FF8C00", textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 16, paddingBottom: 30, paddingTop: 10 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 15, marginBottom: 20, elevation: 4 },
  cardHeader: { marginBottom: 12 },
  reportId: { fontWeight: 'bold', color: '#FF8C00', fontSize: 13 },
  image: { width: "100%", height: 200, borderRadius: 15, marginBottom: 15 },
  infoContainer: { gap: 4 },
  infoRow: { flexDirection: 'row', paddingVertical: 3 },
  boldLabel: { width: 75, fontWeight: "bold", color: "#FF8C00", fontSize: 13 },
  valueText: { flex: 1, color: "#444", fontSize: 13 },
  descBox: { marginTop: 8, backgroundColor: '#FFF9F0', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#FFE0B2' },
  descText: { fontSize: 12, color: '#666', fontStyle: 'italic' },
  empty: { marginTop: 100, alignItems: "center" },
  emptyText: { color: "#FF8C00", fontSize: 15, fontWeight: 'bold' },
  deleteBtn: { marginTop: 15, backgroundColor: '#e74c3c', padding: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  shopeeStepContainer: { marginTop: 15, marginBottom: 10 },
  shopeeStepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  shopeeStepCircleWrapper: { alignItems: 'center', width: 40 },
  shopeeStepCircle: { width: 25, height: 25, borderRadius: 12.5, justifyContent: 'center', alignItems: 'center' },
  shopeeStepNumber: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  shopeeStepLine: { width: 3, flex: 1, marginTop: 2 },
  shopeeStepInfo: { flex: 1, marginLeft: 10 },
  stepLabel: { fontWeight: 'bold', fontSize: 14 },
  stepDesc: { fontSize: 12, color: '#555', marginTop: 2 },
  // TAMBAHKAN INI:
  label: { 
    fontWeight: "bold", 
    color: "#FF8C00", 
    fontSize: 13, 
    marginBottom: 2 
  }
});

export default MyReportPage;