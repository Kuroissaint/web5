import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  TouchableOpacity, Alert, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import SearchBar from '../../components/SearchBar';
import SearchCard from '../../components/SearchCard';
import Navbar from '../../components/Navbar';
import RegionSelect from '../../components/RegionSelect';
import { Button } from '../../components/Button'; // Pastikan import ini ada
import api, { dataAPI } from '../../services/api';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

const SearchScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({ provinsiId: null, kotaName: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);

  // 1. Munculkan data saat pertama kali halaman dibuka
  useEffect(() => {
    fetchTags();
    performSearch();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await dataAPI.getAllTags();
      if (res.data?.data) setAllTags(res.data.data);
    } catch (error) {
      console.error("Gagal ambil tags:", error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await api.get('/kucing/search', {
        params: { 
          q: searchQuery, 
          provinsi_id: filter.provinsiId, // Kirim ID Provinsi
          kota: filter.kotaName,         // Kirim Nama Kota
          tags: selectedTags             // Kirim Array Tags
        }
      });
      if (response.data?.data) {
        setResults(response.data.data);
      }
    } catch (error) {
      console.error("Search Error:", error);
      Alert.alert("Error", "Gagal mengambil data dari server.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagName: string) => {
    const updated = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName)
      : [...selectedTags, tagName];
    setSelectedTags(updated);
  };

  return (
    <View style={styles.container}>
      <Navbar />
      
      <View style={styles.searchHeader}>
        {/* BARIS 1: Judul & Tombol Laporan */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Meowment 🐾</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}> 
            <TouchableOpacity 
              style={styles.btnCreate} 
              onPress={() => router.push('/searchReport')}
            >
              <Ionicons name="add-circle-outline" size={14} color={Colors.white} />
              <Text style={styles.btnCreateText}>Buat Laporan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnMySearch} 
              onPress={() => router.push('/my-search')}
            >
              <Ionicons name="document-text-outline" size={14} color={Colors.primary} />
              <Text style={styles.btnMySearchText}>Laporan</Text>
            </TouchableOpacity>
          </View>
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

        {/* BARIS 3: Filter Section (Tags & Region) */}
        {showFilter && (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Ciri-ciri (Tags):</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
              {allTags.map((tag: any) => (
                <TouchableOpacity 
                  key={tag.id}
                  style={[styles.tagChip, selectedTags.includes(tag.nama_tag) && styles.tagActive]}
                  onPress={() => toggleTag(tag.nama_tag)}
                >
                  <Text style={[styles.tagText, selectedTags.includes(tag.nama_tag) && { color: '#fff' }]}>
                    {tag.nama_tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Filter Wilayah:</Text>
            <RegionSelect onRegionChange={(data) => {
               setFilter({ provinsiId: data.provinsiId, kotaName: data.lokasiFull });
            }} />
            
            <Button 
              title="Terapkan Filter" 
              onPress={performSearch} 
              style={{ marginTop: 15, height: 40 }} 
            />
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
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
              <Text style={styles.emptyText}>Tidak ada anabul yang ditemukan 😸</Text>
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
  btnCreate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
    elevation: 2,
  },
  btnCreateText: { color: Colors.white, fontWeight: '800', fontSize: 10 },
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
  searchActionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  btnFilterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  // Tag Styles
  tagScroll: { flexDirection: 'row', marginBottom: 10 },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#F1F3F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  tagActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tagText: { fontSize: 11, color: '#666', fontWeight: 'bold' },
  
  columnWrapper: { justifyContent: 'space-between' },
  listContainer: { paddingHorizontal: 16, paddingTop: 15, paddingBottom: 100 },
  emptyBox: { marginTop: 50, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 13 }
});

export default SearchScreen;