import React, { useEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adopsiAPI, kucingAPI, BASE_URL } from '../services/api';
import { Colors } from '../constants/Colors';

const TopTab = createMaterialTopTabNavigator();

// --- TAB 1: STATUS ADOPSI SAYA (Permohonan yang kamu kirim) ---
const AdopsiSayaTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const res = await adopsiAPI.getByUser(user.id); // Mengambil data permohonan
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  if (loading) return <ActivityIndicator style={{flex:1}} color={Colors.primary} />;

  return (
    <View style={styles.tabContainer}>
      <FlatList
        data={data}
        keyExtractor={(item: any) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>Belum ada permohonan adopsi.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.catName}>Mencoba Mengadopsi: {item.nama_kucing}</Text>
            <View style={[styles.badge, {backgroundColor: item.status === 'disetujui' ? '#e8f5e9' : '#fff3e0'}]}>
              <Text style={{color: item.status === 'disetujui' ? 'green' : 'orange', fontWeight: 'bold'}}>
                Status: {item.status || 'Menunggu'}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

// --- TAB 2: KUCING SAYA (Kucing yang kamu hibahkan) ---
const KucingSayaTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCats();
  }, []);

  const fetchMyCats = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      
      const res = await kucingAPI.getAll(); 
      const actualData = res.data.data || []; 
      const myCats = actualData.filter((k: any) => k.pengguna_id === user.id);
      setData(myCats);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.tabContainer}>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.catName}>{item.nama_kucing}</Text>
            <Text style={styles.infoText}>Diposting pada: {new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default function AktivitasSaya() {
  return (
    <TopTab.Navigator
        id="AktivitasTabs" // Tambahkan ID bebas apa saja agar tidak error
        screenOptions={{
            tabBarActiveTintColor: Colors.primary,
            tabBarIndicatorStyle: { backgroundColor: Colors.primary },
            tabBarLabelStyle: { fontWeight: 'bold' },
        }}
    >
      <TopTab.Screen name="Adopsi Saya" component={AdopsiSayaTab} />
      <TopTab.Screen name="Kucing Saya" component={KucingSayaTab} />
    </TopTab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabContainer: { flex: 1, backgroundColor: '#f9f9f9', padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2 },
  catName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  infoText: { fontSize: 12, color: '#777', marginTop: 5 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 8, alignSelf: 'flex-start' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});