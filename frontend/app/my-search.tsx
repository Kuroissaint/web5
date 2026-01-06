import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, ActivityIndicator, Image, Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import api from '../services/api';
import { BASE_URL } from '../services/api';

const MySearchScreen = () => {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (user) {
        // GANTI KE ENDPOINT KUCING, BUKAN PENGAJUAN!
        // Sesuaikan dengan route di backend kamu, biasanya:
        const response = await api.get(`/kucing/user/${user.id}`); 
        
        setReports(response.data.data || []);
      }
    } catch (error) {
      console.error("Gagal ambil laporan:", error);
      Alert.alert("Error", "Gagal mengambil daftar laporan kamu.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'selesai': return { bg: '#E6F4EA', text: '#1E8E3E' };
      case 'proses': return { bg: '#FEF7E0', text: '#B06000' };
      default: return { bg: '#F1F3F5', text: '#5F6368' };
    }
  };

  const renderItem = ({ item, index }: any) => {
      const statusColor = getStatusStyle(item.status || 'hilang');
      
      // Perbaiki URL Gambar: Gunakan BASE_URL dari services/api agar konsisten
      const imageUrl = item.foto ? `${BASE_URL}${item.foto}` : null;

      return (
          <Animated.View entering={FadeInLeft.delay(index * 100)} style={styles.card}>
              <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                      <Text style={[styles.statusText, { color: statusColor.text }]}>
                          ● {item.status === 'hilang' ? 'Mencari' : 'Ditemukan'}
                      </Text>
                  </View>
                  <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString('id-ID')}</Text>
              </View>

              <View style={styles.cardBody}>
                  {imageUrl && (
                      <Image source={{ uri: imageUrl }} style={styles.catImage} />
                  )}

                  <Text style={styles.reportTitle}>{item.nama_kucing || 'Kucing Tanpa Nama'}</Text>
                  
                  <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={14} color="#666" />
                      <Text style={styles.infoText}>{item.lokasi_display || 'Lokasi tidak diketahui'}</Text>
                  </View>
                  
                  <Text style={styles.description} numberOfLines={2}>
                      {item.deskripsi || 'Tidak ada deskripsi tambahan.'}
                  </Text>
              </View>

              {/* --- TAMBAHKAN TOMBOL INI DI SINI --- */}
              <View style={styles.cardFooter}>
                  <TouchableOpacity 
                      style={styles.btnDetailReport} 
                      onPress={() => router.push(`/detail/${item.id}`)}
                  >
                      <Text style={styles.btnDetailText}>Lihat Detail & Update Status</Text>
                      <Ionicons name="chevron-forward" size={16} color="#9e7363" />
                  </TouchableOpacity>
              </View>
          </Animated.View>
      );
  };

  return (
    <View style={styles.container}>
      {/* Header Bar mirip di Vue */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pantau Status 🐾</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#9e7363" />
          <Text style={styles.loadingText}>Memuat laporanmu...</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Image 
                source={require('../assets/kucheng.png')} 
                style={styles.emptyImg} 
              />
              <Text style={styles.emptyTitle}>Belum ada laporan</Text>
              <Text style={styles.emptySub}>Kamu belum pernah melaporkan kucing.</Text>
              <TouchableOpacity 
                style={styles.btnAction}
                onPress={() => router.push('/rescue')}
              >
                <Text style={styles.btnActionText}>Buat Laporan Sekarang</Text>
              </TouchableOpacity>
              
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingBottom: 20, 
    paddingHorizontal: 20, 
    backgroundColor: '#fff' 
  },
  backBtn: { padding: 5, marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  list: { padding: 20 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  catImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#eee' // Placeholder saat loading
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    paddingTop: 15,
    marginTop: 5,
  },
  btnDetailReport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  btnDetailText: {
    color: '#9e7363', // Warna cokelat biar senada
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  cardBody: { marginBottom: 15 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  dateText: { fontSize: 12, color: '#999' },
  reportTitle: { fontSize: 18, fontWeight: 'bold', color: '#313957', marginBottom: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 5 },
  infoText: { fontSize: 13, color: '#666' },
  description: { fontSize: 14, color: '#667085', lineHeight: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 10, color: '#666' },
  emptyImg: { width: 120, height: 120, opacity: 0.5, marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  emptySub: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 5, marginBottom: 20 },
  btnAction: { backgroundColor: '#9e7363', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12 },
  btnActionText: { color: '#fff', fontWeight: 'bold' }
});

export default MySearchScreen;