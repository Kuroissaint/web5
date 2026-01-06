import api, { BASE_URL, kucingAPI } from '../../services/api';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react'; // Hapus useEffect jika tidak dipakai lagi
import { 
  View, Text, TextInput, FlatList, Image, TouchableOpacity, 
  StyleSheet, ActivityIndicator, StatusBar, Pressable 
} from 'react-native';

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
  
  // 1. Bungkus fetchKucingList dengan useCallback agar "stabil"
  const fetchKucingList = useCallback(async () => {
    setIsLoading(true);
    console.log("Mencoba fetch ke:", `${BASE_URL}/api/kucing`);
    try {
      const response = await api.get('/api/kucing'); 
      const result = response.data;
      const actualData = Array.isArray(result) ? result : (result.data || []);

      const mappedData = actualData.map((k: any) => {
        const fotoString = k.url_gambar || "";
        const daftarFoto = fotoString.split(',').filter((f: string) => f.trim() !== "");

        const galeriLengkap = daftarFoto.map((namaFile: string) => {
          const file = namaFile.trim();
          if (file.startsWith('http')) return file;
          if (file.startsWith('/uploads') || file.startsWith('uploads')) {
            const cleanPath = file.startsWith('/') ? file : `/${file}`;
            return `${BASE_URL}${cleanPath}`;
          }
          return `${BASE_URL}/uploads/${file}`;
        });

        return {
          id: k.id,
          nama: k.nama_kucing,
          umur: k.umur,
          warnaBulu: k.warna_bulu,
          jenisKelamin: k.jenis_kelamin,
          deskripsi: k.deskripsi,
          kota: k.nama_kabupaten_kota || "Tidak ada lokasi",
          galeri: galeriLengkap,
        };
      });

      setKucingList(mappedData);
    } catch (error: any) {
      console.error('Fetch Error:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []); // [] artinya fungsi ini tidak berubah-ubah

  // 2. Gunakan useFocusEffect untuk auto-refresh
  useFocusEffect(
    useCallback(() => {
      fetchKucingList(); 
    }, [fetchKucingList]) // fetchKucingList dimasukkan ke sini agar tidak merah
  );

  const filteredCats = kucingList.filter(kucing =>
    kucing.nama.toLowerCase().includes(pencarian.toLowerCase()) ||
    kucing.kota.toLowerCase().includes(pencarian.toLowerCase())
  );

  const renderCatCard = ({ item }: { item: any }) => (
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
              { backgroundColor: item.jenisKelamin.toLowerCase() === 'jantan' ? '#E3F2FD' : '#FCE4EC' }
            ]}>
              <Text style={[
                styles.genderText, 
                { color: item.jenisKelamin.toLowerCase() === 'jantan' ? '#1976D2' : '#C2185B' }
              ]}>
                {item.jenisKelamin}
              </Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.catName} numberOfLines={1}>{item.nama}</Text>
            <Text style={styles.locationText}>📍 {item.kota}</Text>
            <View style={styles.chipContainer}>
              <View style={styles.chip}><Text style={styles.chipText}>{item.umur} Bln</Text></View>
              <View style={styles.chip}><Text style={styles.chipText}>{item.warnaBulu}</Text></View>
            </View>
            <View style={[
              styles.btnDetail, 
              { 
                backgroundColor: pressed ? '#7c4f3a' : '#FFF0E0',
                transform: [{ scale: pressed ? 0.96 : 1 }] 
              }
            ]}>
              <Text style={[styles.btnDetailText, { color: pressed ? 'white' : '#f7961d' }]}>
                Lihat Detail
              </Text>
            </View>
          </View>
        </>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Temukan Sahabat Baru</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari lokasi atau nama kucing..."
            placeholderTextColor="#999"
            value={pencarian}
            onChangeText={setPencarian}
          />
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Kucing Siap Adopsi</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#f7961d" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredCats}
            renderItem={renderCatCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            // Tambahkan ini agar bisa ditarik ke bawah untuk refresh manual
            onRefresh={fetchKucingList}
            refreshing={isLoading}
          />
        )}
      </View>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AjukanKucing')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>🏠</Text>
        <Text style={styles.fabText}>Daftarkan Kucing</Text>
      </TouchableOpacity>
    </View>
  );
};

// ... Styles tetap sama ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { 
    backgroundColor: '#f7c58f', 
    paddingHorizontal: 25, 
    paddingTop: 30, 
    paddingBottom: 50,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingHorizontal: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  searchInput: { height: 55, fontSize: 16, color: '#333' },
  mainContent: { flex: 1, paddingHorizontal: 20, marginTop: -25 },
  titleRow: { marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  row: { justifyContent: 'space-between' },
  catCard: { 
    backgroundColor: 'white', 
    borderRadius: 25, 
    marginBottom: 20, 
    width: '48%', 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    overflow: 'hidden'
  },
  imageWrapper: { width: '100%', height: 160, position: 'relative' },
  catImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#F0F0F0' },
  genderBadge: { position: 'absolute', top: 10, right: 10, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10 },
  genderText: { fontSize: 10, fontWeight: 'bold' },
  cardContent: { padding: 15, paddingTop: 10 },
  catName: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  locationText: { fontSize: 12, color: '#888', marginBottom: 10 },
  chipContainer: { flexDirection: 'row', gap: 6, marginBottom: 15 },
  chip: { backgroundColor: '#F5F5F5', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8 },
  chipText: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  btnDetail: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f7961d20',
  },
  btnDetailText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#f7961d',
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 30,
    elevation: 10,
    alignItems: 'center',
  },
  fabIcon: { color: 'white', fontSize: 20, marginRight: 8 },
  fabText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});

export default AdoptKucing;