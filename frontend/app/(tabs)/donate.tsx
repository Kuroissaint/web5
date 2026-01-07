import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { donasiAPI } from '../../services/api';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import Navbar from '../../components/Navbar';
import SearchBar from '../../components/SearchBar';

const DonateTab = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      const res = await donasiAPI.getShelters();
      setShelters(res.data.data || []);
    } catch (err) {
      console.error("Gagal ambil shelter:", err);
    } finally { 
      setLoading(false); 
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchShelters();
  };

  const filteredShelters = shelters.filter((item: any) =>
    item.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHeader = () => (
    <View style={styles.sectionPadding}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pilih Mitra Shelter 🐾</Text>
        <Text style={styles.sectionSubtitle}>
          Donasi Anda akan disalurkan langsung untuk biaya makan dan perawatan medis para anabul.
        </Text>
      </View>
    </View>
  );

  const renderShelter = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.shelterCard}
      onPress={() => router.push({ 
        pathname: `/donate/${item.id}`, 
        params: { shelter: JSON.stringify(item) } 
      })}
    >
      <View style={styles.imagePlaceholder}>
        <Ionicons name="business" size={30} color={Colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.shelterName}>{item.username}</Text>
        
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.border} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Navbar />

      {/* HEADER GAYA SEARCHSCREEN */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Donasi Shelter 🐾</Text>
          <TouchableOpacity 
            style={styles.btnAction} 
            onPress={() => router.push('/aktivitas')} // Arahkan ke halaman riwayat/aktivitas
          >
            <Ionicons name="time-outline" size={14} color={Colors.primary} />
            <Text style={styles.btnActionText}>Riwayat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <SearchBar 
            value={searchQuery} 
            onChangeText={setSearchQuery} 
            placeholder="Cari nama shelter..." 
          />
        </View>
      </View>

      <SafeAreaView style={styles.viewBg} edges={['bottom', 'left', 'right']}>
        {loading ? (
          <View style={styles.centerWrapper}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredShelters}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={renderShelter}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.centerWrapper}>
                <Text style={styles.emptyText}>Belum ada shelter yang terdaftar 😸</Text>
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
  
  // Header Container (White + Shadow)
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
  
  // Tombol Aksi di Header
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF0E6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 4,
  },
  btnActionText: { color: Colors.primary, fontWeight: '700', fontSize: 10 },
  
  searchRow: { marginTop: 4 },

  // Content Styles
  sectionPadding: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: { marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  sectionSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 4, lineHeight: 18 },

  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  
  // Card Shelter Styles
  shelterCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 20, 
    backgroundColor: Colors.white,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee'
  },
  imagePlaceholder: { 
    width: 60, 
    height: 60, 
    borderRadius: 15, 
    backgroundColor: '#FDF5F0', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15 
  },
  info: { flex: 1 },
  shelterName: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  shelterDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  
  centerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { textAlign: 'center', color: Colors.textMuted },
});

export default DonateTab;