import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { donasiAPI, BASE_URL } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

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
    } finally { setLoading(false); }
  };

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
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Donasi Shelter 🐾</Text>
        <Text style={styles.subtitle}>Uluran tanganmu sangat berarti bagi mereka.</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={shelters}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={renderShelter}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Belum ada shelter yang terdaftar.</Text>
          }
          onRefresh={fetchShelters}
          refreshing={loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF9' },
  header: { padding: 25, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4d3a31' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 5 },
  listContent: { padding: 20, paddingBottom: 100 },
  shelterCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: 20, 
    backgroundColor: '#fff',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
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
  shelterName: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  shelterDesc: { fontSize: 12, color: '#777', marginTop: 4, lineHeight: 18 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 }
});

export default DonateTab;