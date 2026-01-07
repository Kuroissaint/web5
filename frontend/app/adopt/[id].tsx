import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  SafeAreaView,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router'; //
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../services/api';

const { width } = Dimensions.get('window');

// Konfigurasi ukuran kartu
const CARD_WIDTH = width * 0.82; 
const SPACING = (width - CARD_WIDTH) / 2;

// DAFTAR WARNA PASTEL BACKGROUND DARI SI P
const BG_COLORS = ['#FFF5E1', '#E1F5FE', '#E8F5E9', '#F3E5F5', '#FFF3E0', '#F1F8E9'];

const AdoptDetail = () => {
  const router = useRouter();
  const params = useLocalSearchParams(); // Ambil parameter dari URL
  
  // Ambil dan parse data kucing dengan aman
  const cat = React.useMemo(() => {
    try {
      if (!params.cat) return null;
      return typeof params.cat === 'string' ? JSON.parse(params.cat) : params.cat;
    } catch (e) {
      console.error("Error parsing cat data:", e);
      return null;
    }
  }, [params.cat]);

  const [activeIndex, setActiveIndex] = useState(0);

  // Tampilkan loading jika data belum siap untuk mencegah error .map
  if (!cat) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#f7961d" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* === 1. IMAGE SLIDER DENGAN WARNA BACKGROUND BEDA-BEDA === */}
        <View style={styles.sliderWrapper}>
          <FlatList
            // Gunakan || [] agar data tidak undefined
            data={cat.galeri || []}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            snapToInterval={CARD_WIDTH + 20} 
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: SPACING - 10,
              paddingVertical: 20
            }}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveIndex(Math.round(x / (CARD_WIDTH + 20)));
            }}
            renderItem={({ item, index }) => (
              <View 
                style={[
                  styles.cardContainer, 
                  { backgroundColor: BG_COLORS[index % BG_COLORS.length] } 
                ]}
              >
                <Image source={{ uri: item }} style={styles.framedImage} />
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
          />
          
          {/* TITIK INDIKATOR (FIX ERROR MAP) */}
          <View style={styles.pagination}>
            {(cat.galeri || []).map((_: any, i: number) => (
              <View 
                key={i} 
                style={[styles.dot, activeIndex === i ? styles.activeDot : styles.inactiveDot]} 
              />
            ))}
          </View>

          {/* TOMBOL BACK */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* === 2. KARTU INFORMASI === */}
        <View style={styles.infoWrapper}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.catName}>{cat.nama || "Anabul"}</Text>
              <Text style={styles.locationText}>📍 {cat.alamatLengkap || cat.kota || "Lokasi tidak tersedia"}</Text>
            </View>
          </View>

          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Sex</Text>
              <Text style={styles.chipValue}>{cat.jenisKelamin || "-"}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Age</Text>
              <Text style={styles.chipValue}>{cat.umur || "0"} Bln</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Color</Text>
              <Text style={styles.chipValue}>{cat.warnaBulu || "-"}</Text>
            </View>
          </View>

          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>About {cat.nama}</Text>
            <Text style={styles.descText}>{cat.deskripsi || "Tidak ada deskripsi tambahan."}</Text>
          </View>
        </View>
        
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* === 3. FOOTER === */}
      <View style={styles.footer}>
        <TouchableOpacity 
            style={styles.btnChat} 
            onPress={() => router.push({
                pathname: `/chat/${cat.pengguna_id}`, // Arahkan ke rute chat si A
                params: { name: cat.nama }
            })}
        >
            <Ionicons name="chatbubble-ellipses-outline" size={26} color="#f7961d" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.btnAdopt} 
          onPress={() => router.push({
            pathname: '/form-adopsi', // Arahkan ke rute form adopsi si P
            params: { cat: JSON.stringify(cat) }
          })}
        >
          <Text style={styles.btnText}>Adopt Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#FDFDFD' },
  sliderWrapper: { 
    backgroundColor: '#FDFDFD', 
    paddingTop: 10,
    position: 'relative' 
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: 380,
    marginHorizontal: 10,
    borderRadius: 40, 
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  framedImage: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover'
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    gap: 8
  },
  dot: { height: 8, borderRadius: 4 },
  activeDot: { width: 22, backgroundColor: '#f7961d' },
  inactiveDot: { width: 8, backgroundColor: '#E0E0E0' },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 15,
    elevation: 5
  },
  infoWrapper: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25
  },
  catName: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  locationText: { fontSize: 14, color: '#999', marginTop: 4 },
  chipRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  chip: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 20, width: '30%', alignItems: 'center' },
  chipLabel: { fontSize: 12, color: '#AAA', marginBottom: 4 },
  chipValue: { fontSize: 15, fontWeight: 'bold', color: '#444' },
  descSection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  descText: { fontSize: 15, color: '#666', lineHeight: 24 },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: width,
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingBottom: 30
  },
  btnChat: {
    width: 65,
    height: 65,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#f7961d',
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnAdopt: {
    flex: 1,
    backgroundColor: '#f7961d',
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});

export default AdoptDetail;