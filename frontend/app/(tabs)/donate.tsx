import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { donasiAPI } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import Navbar from '../../components/Navbar'; // 1. Import Navbar

const DonateTab = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
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
    }
  };

  const renderHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Pilih Mitra Shelter 🐾</Text>
      <Text style={styles.sectionSubtitle}>
        Donasi kamu akan disalurkan langsung untuk biaya makan dan perawatan medis anabul.
      </Text>
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
        <Text style={styles.shelterName}>{item.nama}</Text>
        <Text style={styles.shelterDesc} numberOfLines={2}>
          {item.deskripsi_shelter || "Membantu kucing-kucing liar mendapatkan perawatan dan rumah baru."}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.border} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      {/* 2. Navbar Brand di paling atas */}
      <Navbar />

      <SafeAreaView style={styles.viewBg} edges={['bottom', 'left', 'right']}>
        {/* 3. Header Banner Cokelat Meowment yang Konsisten */}
        <View style={styles.headerBanner}>
          <Text style={styles.headerTitle}>Donasi</Text>
        </View>

        {loading ? (
          <View style={styles.centerWrapper}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={shelters}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={renderShelter}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.centerWrapper}>
                <Text style={styles.emptyText}>Belum ada shelter yang terdaftar.</Text>
              </View>
            }
            onRefresh={fetchShelters}
            refreshing={loading}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.white },
  viewBg: { flex: 1, backgroundColor: '#FDFBF9' }, // Latar belakang cream lembut
  
  // Header Banner Signature Meowment
  headerBanner: { 
    padding: 24, 
    paddingTop: 10, 
    backgroundColor: Colors.primary, // Cokelat Meowment dari constants
    borderBottomRightRadius: 30,
    marginBottom: 5
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: Colors.white },

  // Section Label
  sectionHeader: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: Colors.textPrimary },
  sectionSubtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 4, lineHeight: 18 },

  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  
  // Card Shelter
  shelterCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 20, 
    backgroundColor: Colors.white,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F0E6DE' // Border halus kecokelatan
  },
  imagePlaceholder: { 
    width: 65, 
    height: 65, 
    borderRadius: 18, 
    backgroundColor: '#FDF5F0', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15 
  },
  info: { flex: 1 },
  shelterName: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  shelterDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  
  centerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { textAlign: 'center', color: Colors.textMuted },
});

export default DonateTab;