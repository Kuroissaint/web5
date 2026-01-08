import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Pressable 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import api, { BASE_URL } from '../../services/api';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import Navbar from '../../components/Navbar';
import SearchBar from '../../components/SearchBar';
import { getUserData } from '../../services/api';

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
  const [userStatus, setUserStatus] = useState<'user' | 'shelter'>('user');
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
          
          return file.startsWith('/') ? `${BASE_URL}${file}` : `${BASE_URL}/uploads/${file}`;
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

  const fetchUserStatus = async () => {
    try {
      const userData = await getUserData(); 
      if (userData && userData.id) {
        const response = await fetch(`${BASE_URL}/api/cek-status/${userData.id}`);
        const result = await response.json();
        if (result.success && result.data) {
          setUserStatus(result.data.status);
        }
      }
    } catch (error: any) {
      console.log("❌ Gagal cek status:", error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchKucingList(); 
      fetchUserStatus(); 
    }, [fetchKucingList])
  );

  const filteredCats = kucingList.filter(kucing =>
    kucing.nama?.toLowerCase().includes(pencarian.toLowerCase()) ||
    kucing.kota?.toLowerCase().includes(pencarian.toLowerCase())
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
    <View style={styles.container}>
      <Navbar /> 

      {/* HEADER BARU GAYA SEARCHSCREEN */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Adopsi Kucing 🐱</Text>
          <TouchableOpacity 
            style={[
              styles.btnAction,
              userStatus !== 'user' && { backgroundColor: Colors.success } // Berubah hijau jika shelter
            ]} 
            onPress={() => router.push(userStatus === 'user' ? '/form-ajuan' : '/aktivitas')} // Redirect ke aktivitas jika shelter
          >
            <Ionicons 
              name={userStatus === 'user' ? "add-circle-outline" : "list-outline"} 
              size={14} 
              color={Colors.white} 
            />
            <Text style={styles.btnActionText}>
              {userStatus === 'user' ? "Daftarkan" : "Kelola Pengajuan"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <SearchBar 
            value={pencarian} 
            onChangeText={setPencarian} 
            placeholder="Cari nama atau kota..." 
          />
        </View>
      </View>

      <SafeAreaView style={styles.viewBg} edges={['bottom', 'left', 'right']}>
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
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            onRefresh={fetchKucingList}
            refreshing={isLoading}
            ListEmptyComponent={
              <View style={styles.centerWrapper}>
                <Text style={{ color: Colors.textMuted }}>Tidak ada anabul yang cocok 😸</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    viewBg: { flex: 1, backgroundColor: '#FAFAFA' },
    
    headerContainer: { 
      paddingHorizontal: 16, 
      paddingBottom: 12,       // Diubah dari 16 ke 12 agar sama dengan search
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
      marginVertical: 8,       // Disamakan dengan marginVertical headerRow search
    },
    headerTitle: { fontSize: 18, fontWeight: '900', color: Colors.primary },
    
    btnAction: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.primary,
      paddingVertical: 5,      // Disamakan dengan btnCreate search
      paddingHorizontal: 12,
      borderRadius: 8,
      gap: 4,
      elevation: 2,
    },
    btnActionText: { color: Colors.white, fontWeight: '800', fontSize: 10 },
    
    searchRow: { marginTop: 4 },
  
    listContainer: { 
      paddingHorizontal: 16, 
      paddingTop: 15,          // Disamakan dengan search
      paddingBottom: 100 
    },
    columnWrapper: { justifyContent: 'space-between' },
    
    catCard: { 
      backgroundColor: Colors.white, 
      borderRadius: 20,        // Sudah konsisten
      marginBottom: 16, 
      width: '48%', 
      elevation: 3,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#eee'
    },
  imageWrapper: { width: '100%', height: 150, position: 'relative' },
  catImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#f0f0f0' },
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
  
  centerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }
});

export default AdoptKucing;