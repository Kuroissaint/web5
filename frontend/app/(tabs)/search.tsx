import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  TouchableOpacity, Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import SearchBar from '../../components/SearchBar';
import SearchCard from '../../components/SearchCard';
import Navbar from '../../components/Navbar';
import RegionSelect from '../../components/RegionSelect';
import api from '../../services/api';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

const SearchScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({ provinsiId: null, kotaName: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State untuk buka/tutup filter wilayah
  const [showFilter, setShowFilter] = useState(false);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await api.get('/kucing/search', {
        params: { 
          q: searchQuery, 
          provinsi_id: filter.provinsiId, 
          kota: filter.kotaName 
        }
      });
      if (response.data?.data) setResults(response.data.data);
    } catch (error) {
      Alert.alert("Error", "Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Navbar />
      
      <View style={styles.searchHeader}>
        {/* BARIS 1: Judul & Tombol Laporan */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Meowment 🐾</Text>
          <TouchableOpacity 
            style={styles.btnMySearch} 
            onPress={() => router.push('/my-search')}
          >
            <Ionicons name="document-text-outline" size={14} color={Colors.primary} />
            <Text style={styles.btnMySearchText}>Laporan Saya</Text>
          </TouchableOpacity>
        </View>

        {/* BARIS 2: Search Bar + Tombol Toggle Filter */}
        <View style={styles.searchActionRow}>
          <View style={{ flex: 1 }}>
            <SearchBar 
              value={searchQuery} 
              onChangeText={setSearchQuery} 
              onSubmit={performSearch} 
            />
          </View>
          <TouchableOpacity 
            style={[styles.btnFilter, showFilter && styles.btnFilterActive]} 
            onPress={() => setShowFilter(!showFilter)}
          >
            <Ionicons 
              name={showFilter ? "chevron-up" : "options-outline"} 
              size={20} 
              color={showFilter ? Colors.white : Colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* BARIS 3: Region Select (Hanya muncul jika showFilter = true) */}
        {showFilter && (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Filter Lokasi:</Text>
            <RegionSelect 
              onRegionChange={(data) => {
                setFilter({ provinsiId: data.provinsiId, kotaName: data.lokasiFull });
                performSearch();
              }} 
            />
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          numColumns={2} // KUNCI UTAMA GRID 2 KOLOM
          columnWrapperStyle={styles.columnWrapper} // Jarak antar kolom
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <SearchCard 
              item={item} 
              onPress={() => router.push(`/detail/${item.id}`)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Gunakan filter untuk mencari anabul 😸</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  
  searchHeader: { 
    paddingHorizontal: 16, 
    paddingBottom: 12, 
    backgroundColor: Colors.white, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20, 
    ...Layout.shadow,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: Colors.primary },
  
  btnMySearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF0E6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 4,
  },
  btnMySearchText: { color: Colors.primary, fontWeight: '700', fontSize: 10 },

  // ROW UNTUK SEARCH + FILTER
  searchActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnFilter: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F3F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnFilterActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  // SECTION FILTER YANG BISA DI-TOGGLE
  filterSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  columnWrapper: {
    justifyContent: 'space-between', // Biar kartu kiri dan kanan ada jaraknya
  },
  listContainer: { 
    paddingHorizontal: 16, 
    paddingTop: 15, 
    paddingBottom: 100 
  },
  emptyBox: { marginTop: 50, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 13 }
});

export default SearchScreen;