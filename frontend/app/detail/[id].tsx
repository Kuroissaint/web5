import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, 
  TouchableOpacity, ActivityIndicator, Linking, Alert, Dimensions 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { kucingAPI, BASE_URL } from '../../services/api'; //
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

const DetailKucingScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [cat, setCat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await kucingAPI.getById(id as string); //
      if (response.data?.success) {
        const data = response.data.data;
        setCat(data);
        // Set foto utama dari list_foto_url atau foto default
        const photos = data.list_foto_url ? data.list_foto_url.split(',') : [];
        setActivePhoto(photos.length > 0 ? `${BASE_URL}${photos[0]}` : null);
      }
    } catch (error) {
      Alert.alert("Error", "Gagal memuat detail kucing.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!cat?.kontak_pelapor) return;
    // Format nomor WA (hilangkan karakter non-digit)
    const phone = cat.kontak_pelapor.replace(/\D/g, '');
    const message = `Halo, saya melihat laporan kucing "${cat.nama_kucing}" di Meowment. Apakah masih ada?`;
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10 }}>Memuat data anabul...</Text>
      </View>
    );
  }

  const photos = cat?.list_foto_url ? cat.list_foto_url.split(',') : [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Image & Back Button */}
        <View style={styles.imageContainer}>
          <Image 
            source={activePhoto ? { uri: activePhoto } : require('../../assets/logo.png')} 
            style={styles.mainImage}
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Thumbnail List */}
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
          <Text style={styles.catName}>{cat?.nama_kucing || "Anabul"}</Text>
          
          {/* Tags */}
          <View style={styles.tagRow}>
            {cat?.tags?.split(',').map((tag: string, i: number) => (
              <View key={i} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag.trim()}</Text>
              </View>
            ))}
          </View>

          {/* Info Grid (Mirip Web) */}
          <View style={styles.grid}>
            <InfoItem label="Status" value={cat?.status} color={cat?.status === 'hilang' ? '#d93025' : '#1e8e3e'} />
            <InfoItem label="Jenis" value={cat?.jenis_kucing || 'Kampung'} />
            <InfoItem label="Waktu" value={cat?.waktu_hilang ? new Date(cat.waktu_hilang).toLocaleDateString() : '-'} />
            <InfoItem label="Lokasi" value={cat?.lokasi_display} isFullWidth />
          </View>

          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.description}>{cat?.deskripsi || "Tidak ada deskripsi tambahan."}</Text>
          
          <View style={{ height: 100 }} /> 
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.btnWA} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="white" />
          <Text style={styles.btnWAText}>Hubungi Pelapor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Helper Component untuk Grid
const InfoItem = ({ label, value, color = '#333', isFullWidth = false }: any) => (
  <View style={[styles.infoItem, isFullWidth && { width: '100%' }]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, { color }]}>{value || '-'}</Text>
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
  catName: { fontSize: 28, fontWeight: '900', color: '#333', marginBottom: 10 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  tagChip: { backgroundColor: '#f0e6e0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15 },
  tagText: { color: '#8d6e63', fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  infoItem: { width: (width - 55) / 2 },
  infoLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 25, marginBottom: 10 },
  description: { fontSize: 15, color: '#666', lineHeight: 22 },
  bottomActions: { 
    position: 'absolute', bottom: 0, width: '100%', 
    padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee' 
  },
  btnWA: { 
    backgroundColor: '#25D366', flexDirection: 'row', 
    justifyContent: 'center', alignItems: 'center', 
    padding: 15, borderRadius: 12, gap: 10 
  },
  btnWAText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default DetailKucingScreen;