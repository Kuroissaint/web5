import React, { useState, useCallback } from 'react';
import { 
  View, Text, TextInput, FlatList, Image, TouchableOpacity, 
  StyleSheet, ActivityIndicator, Pressable 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import api, { BASE_URL } from '../../services/api';
import { Colors } from '../../constants/Colors';
import Navbar from '../../components/Navbar'; // 1. Import Navbar

interface Kucing {
  id: number;
  nama: string;
  umur: string;
  kota: string;
  galeri: string[];
  warnaBulu: string;
  jenisKelamin: string;
  deskripsi: string;
}

const AdoptKucing = () => {
  const [pencarian, setPencarian] = useState('');
  const [kucingList, setKucingList] = useState<Kucing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchKucingList = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/kucing'); 
      const result = response.data;
      const actualData = Array.isArray(result) ? result : (result.data || []);

      const mappedData = actualData.map((k: any) => {
        const fotoString = k.url_gambar || "";
        const daftarFoto = fotoString.split(',').filter((f: string) => f.trim() !== "");
        const galeriLengkap = daftarFoto.map((namaFile: string) => {
          const file = namaFile.trim();
          if (file.startsWith('http')) return file;
          return `${BASE_URL}/uploads/${file}`;
        });

        return {
          id: k.id,
          nama: k.nama_kucing,
          umur: k.umur,
          warnaBulu: k.warna_bulu,
          jenisKelamin: k.jenis_kelamin,
          deskripsi: k.deskripsi,
          kota: k.nama_kabupaten_kota || "Lokasi tidak tersedia",
          galeri: galeriLengkap,
        };
      });
      setKucingList(mappedData);
    } catch (error: any) {
      console.error('Fetch Error Adopsi:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchKucingList(); 
    }, [fetchKucingList])
  );

  const filteredCats = kucingList.filter(kucing =>
    kucing.nama?.toLowerCase().includes(pencarian.toLowerCase()) ||
    kucing.kota?.toLowerCase().includes(pencarian.toLowerCase())
  );

  const renderHeader = () => (
    <View style={styles.contentPadding}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari lokasi atau nama kucing..."
          placeholderTextColor={Colors.textMuted}
          value={pencarian}
          onChangeText={setPencarian}
        />
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Kucing Siap Adopsi 🐱</Text>
      </View>
    </View>
  );

  const renderCatCard = ({ item }: { item: Kucing }) => {
    const genderSafe = (item.jenisKelamin || "").toLowerCase();
    const isJantan = genderSafe === 'jantan';

    return (
      <Pressable 
        onPress={() => router.push({ pathname: `/adopt/${item.id}`, params: { cat: JSON.stringify(item) } })}
        style={styles.catCard}
      >
        {({ pressed }) => (
          <>
            <View style={styles.imageWrapper}>
              {item.galeri.length > 0 ? (
                <Image source={{ uri: item.galeri[0] }} style={styles.catImage} />
              ) : (
                <View style={styles.imagePlaceholder} />
              )}
              <View style={[
                styles.genderBadge, 
                { backgroundColor: isJantan ? '#E3F2FD' : '#FCE4EC' }
              ]}>
                <Text style={[
                  styles.genderText, 
                  { color: isJantan ? '#1976D2' : '#C2185B' }
                ]}>
                  {item.jenisKelamin || "Misterius"}
                </Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.catName} numberOfLines={1}>{item.nama || "Tanpa Nama"}</Text>
              <Text style={styles.locationText}>📍 {item.kota}</Text>
              <View style={styles.chipContainer}>
                <View style={styles.chip}><Text style={styles.chipText}>{item.umur || 0} Bln</Text></View>
                <View style={styles.chip}><Text style={styles.chipText}>{item.warnaBulu || "-"}</Text></View>
              </View>
              <View style={[
                styles.btnDetail, 
                { 
                  backgroundColor: pressed ? Colors.primary : '#FDF5F0',
                  borderColor: Colors.primary,
                  transform: [{ scale: pressed ? 0.96 : 1 }] 
                }
              ]}>
                <Text style={[styles.btnDetailText, { color: pressed ? Colors.white : Colors.primary }]}>
                  Lihat Detail
                </Text>
              </View>
            </View>
          </>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <Navbar /> 

      <SafeAreaView style={styles.viewBg} edges={['bottom', 'left', 'right']}>
        {/* Banner Judul Konsisten */}
        <View style={styles.headerBanner}>
          <Text style={styles.headerTitle}>Adopsi Kucing</Text>
        </View>

        {isLoading ? (
          <View style={styles.centerWrapper}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredCats}
            renderItem={renderCatCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            onRefresh={fetchKucingList}
            refreshing={isLoading}
          />
        )}
      </SafeAreaView>

      {/* FAB berwarna Cokelat */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/form-ajuan')} 
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>🏠</Text>
        <Text style={styles.fabText}>Daftarkan Kucing</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.white },
  viewBg: { flex: 1, backgroundColor: '#F8F9FB' },
  
  headerBanner: { 
    padding: 24, 
    paddingTop: 10, 
    backgroundColor: Colors.primary, 
    borderBottomRightRadius: 30,
    marginBottom: 5
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: Colors.white },
  
  contentPadding: { paddingHorizontal: 20, paddingTop: 20 },
  searchContainer: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border
  },
  searchInput: { height: 50, fontSize: 15, color: Colors.textPrimary },
  
  titleRow: { marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  
  listContainer: { paddingBottom: 100 },
  row: { justifyContent: 'space-between', paddingHorizontal: 20 },
  
  catCard: { 
    backgroundColor: Colors.white, 
    borderRadius: 20, 
    marginBottom: 20, 
    width: '48%', 
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0E6DE'
  },
  imageWrapper: { width: '100%', height: 150, position: 'relative' },
  catImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#F0F0F0' },
  genderBadge: { position: 'absolute', top: 10, right: 10, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  genderText: { fontSize: 9, fontWeight: 'bold' },
  
  cardContent: { padding: 12 },
  catName: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 2 },
  locationText: { fontSize: 11, color: Colors.textMuted, marginBottom: 10 },
  
  chipContainer: { flexDirection: 'row', gap: 4, marginBottom: 12 },
  chip: { backgroundColor: '#FDF5F0', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  chipText: { fontSize: 9, color: Colors.primary, fontWeight: 'bold' },
  
  btnDetail: { paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  btnDetailText: { fontWeight: '800', fontSize: 12 },
  
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 8,
    alignItems: 'center',
  },
  fabIcon: { color: Colors.white, fontSize: 18, marginRight: 8 },
  fabText: { color: Colors.white, fontWeight: 'bold', fontSize: 13 },
  centerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }
});

export default AdoptKucing;