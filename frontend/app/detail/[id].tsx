import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, 
  TouchableOpacity, ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { kucingAPI, BASE_URL } from '../../services/api';
import { Colors } from '../../constants/Colors';
const { width } = Dimensions.get('window');

const DetailKucingScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [cat, setCat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // 1. Ambil data User dari Storage
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) setCurrentUser(JSON.parse(userStr));

      // 2. Ambil detail kucing
      const response = await kucingAPI.getById(id as string);
      if (response.data?.success) {
        const data = response.data.data;
        setCat(data);
        const photos = data.list_foto_url ? data.list_foto_url.split(',') : [];
        setActivePhoto(photos.length > 0 ? `${BASE_URL}${photos[0]}` : null);
      }
    } catch (error) {
      Alert.alert("Error", "Gagal memuat detail anabul.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk update status (Hanya bisa dilakukan pemilik atau tombol khusus)
  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const response = await api.put(`/kucing/${id}/status`, { status: newStatus });
      if (response.data.success) {
        Alert.alert("Berhasil", `Status anabul sekarang: ${newStatus}`);
        loadInitialData(); // Refresh data
      }
    } catch (error) {
      Alert.alert("Error", "Gagal memperbarui status.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Hapus Laporan", 
      "Apakah Anda yakin ingin menghapus laporan ini secara permanen?", 
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya, Hapus", 
          style: "destructive", 
          onPress: async () => {
            try {
              // Pastikan menggunakan cat.id atau parameter id dari URL
              const response = await api.delete(`/kucing/${id}`);
              if (response.data.success) {
                Alert.alert("Berhasil", "Laporan telah dihapus.");
                router.replace('/(tabs)/search'); // Kembali ke halaman pencarian
              }
            } catch (error) {
              Alert.alert("Error", "Gagal menghapus laporan.");
            }
          } 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // IDENTIFIKASI POV: Apakah ini laporan milik saya?
  const isOwner = currentUser?.id === cat?.pengguna_id;
  const photos = cat?.list_foto_url ? cat.list_foto_url.split(',') : [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image 
            source={activePhoto ? { uri: activePhoto } : require('../../assets/logo.png')} 
            style={styles.mainImage}
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {photos.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbList}>
            {photos.map((p: string, i: number) => (
              <TouchableOpacity key={i} onPress={() => setActivePhoto(`${BASE_URL}${p}`)}>
                <Image 
                  source={{ uri: `${BASE_URL}${p}` }} 
                  style={[styles.thumb, activePhoto === `${BASE_URL}${p}` && styles.activeThumb]} 
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.infoContent}>
          <View style={styles.headerRow}>
            <Text style={styles.catName}>{cat?.nama_kucing}</Text>
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: cat?.status === 'hilang' ? '#FFE0E0' : '#E0FFE0' }]}>
              <Text style={{ color: cat?.status === 'hilang' ? '#D32F2F' : '#388E3C', fontWeight: 'bold', fontSize: 10 }}>
                {cat?.status?.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* STATUS STEPPER (Terinspirasi dari MySearchPage) */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepActive]}>
                <Ionicons name="search" size={14} color="white" />
              </View>
              <Text style={styles.stepLabel}>Dilaporkan Hilang</Text>
            </View>
            <View style={[styles.stepLine, cat?.status === 'ditemukan' && styles.lineActive]} />
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, cat?.status === 'ditemukan' && styles.stepActive]}>
                <Ionicons name="checkmark-circle" size={14} color={cat?.status === 'ditemukan' ? "white" : "#CCC"} />
              </View>
              <Text style={styles.stepLabel}>Sudah Ditemukan</Text>
            </View>
          </View>

          <View style={styles.tagRow}>
            {cat?.tags?.split(',').map((tag: string, i: number) => (
              <View key={i} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag.trim()}</Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            <InfoItem label="Jenis/Ras" value={cat?.jenis_kucing || 'Kampung'} />
            <InfoItem label="Terakhir Terlihat" value={cat?.waktu_hilang ? new Date(cat.waktu_hilang).toLocaleDateString('id-ID') : '-'} />
            <InfoItem label="Lokasi Detail" value={cat?.lokasi_display} isFullWidth />
          </View>

          <Text style={styles.sectionTitle}>Ciri-ciri Khusus</Text>
          <Text style={styles.description}>{cat?.deskripsi || "Tidak ada deskripsi tambahan."}</Text>
          
          <View style={{ height: 120 }} /> 
        </View>
      </ScrollView>

      {/* BOTTOM ACTIONS (Dua POV) */}
      <View style={styles.bottomActions}>
        {isOwner ? (
          // POV PEMILIK: Tampilkan Edit, Hapus, dan Tandai Selesai
          <View style={styles.column}>
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.btnAction, { backgroundColor: '#F5F5F5', flex: 1 }]} 
                onPress={() => router.push(`/searchReport?editId=${id}`)}
              >
                <Text style={{ color: '#666', fontWeight: 'bold' }}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.btnAction, { backgroundColor: '#FFE0E0', flex: 1 }]} 
                onPress={handleDelete}
              >
                <Text style={{ color: '#D32F2F', fontWeight: 'bold' }}>Hapus</Text>
              </TouchableOpacity>
            </View>

            {cat?.status === 'hilang' && (
              <TouchableOpacity 
                style={[styles.btnAction, { backgroundColor: Colors.primary, marginTop: 10 }]} 
                onPress={() => handleUpdateStatus('ditemukan')}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Tandai Sudah Ditemukan</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
            // POV PENGGUNA LAIN: Hanya tombol Chat
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.btnChat, { flex: 1 }]} 
                onPress={() => router.push({
                  pathname: `/chat/${cat.pengguna_id}`,
                  params: { name: cat.nama_pelapor }
                })}
              >
                <Ionicons name="chatbubbles-outline" size={20} color={Colors.primary} />
                <Text style={styles.btnChatText}>Chat Pelapor</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

// ... InfoItem Component & Styles ...
const InfoItem = ({ label, value, isFullWidth = false }: any) => (
  <View style={[styles.infoItem, isFullWidth && { width: '100%' }]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { width: '100%', height: 350 },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 20 },
  thumbList: { padding: 15, flexDirection: 'row' },
  thumb: { width: 60, height: 60, borderRadius: 10, marginRight: 10, borderWidth: 2, borderColor: '#eee' },
  activeThumb: { borderColor: Colors.primary },
  infoContent: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  catName: { fontSize: 26, fontWeight: '900', color: '#333' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  
  // Stepper Styles
  stepperContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 15, borderRadius: 15, marginBottom: 20 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EEE', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  stepActive: { backgroundColor: Colors.primary },
  stepLabel: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  stepLine: { width: 40, height: 3, backgroundColor: '#EEE', marginTop: -15 },
  lineActive: { backgroundColor: Colors.primary },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  tagChip: { backgroundColor: '#f0e6e0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15 },
  tagText: { color: '#8d6e63', fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  infoItem: { width: (width - 55) / 2 },
  infoLabel: { fontSize: 11, color: '#999', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#444' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginTop: 25, marginBottom: 10 },
  description: { fontSize: 14, color: '#666', lineHeight: 22 },
  
  column: { flexDirection: 'column' },
  bottomActions: { position: 'absolute', bottom: 0, width: '100%', padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee', paddingBottom: 30 },
  row: { flexDirection: 'row', gap: 12 },
  btnChat: { flex: 1, flexDirection: 'row', height: 50, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  btnChatText: { color: Colors.primary, fontWeight: 'bold' },
  btnFound: { flex: 1.5, height: 50, backgroundColor: Colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnFoundText: { color: 'white', fontWeight: 'bold' },
  btnAction: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});

export default DetailKucingScreen;