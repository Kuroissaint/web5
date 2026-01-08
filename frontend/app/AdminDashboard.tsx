import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { adminAPI, BASE_URL } from '../services/api';
import { Colors } from '../constants/Colors';

const AdminDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'shelter' | 'donasi'>('shelter');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = activeTab === 'shelter' 
        ? await adminAPI.getPendingShelters() 
        : await adminAPI.getPendingDonations();
      
      setData(res.data.data || []);
    } catch (error) {
      console.error("Gagal ambil data admin:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [activeTab])
  );

  const handleVerifyShelter = (id: number, action: 'disetujui' | 'ditolak') => {
    Alert.alert("Konfirmasi", `Yakin ingin ${action} shelter ini?`, [
      { text: "Batal", style: "cancel" },
      { 
        text: "Ya, Lanjutkan", 
        onPress: async () => {
          try {
            await adminAPI.verifyShelter({ pengajuan_id: id, action });
            Alert.alert("Berhasil", `Pengajuan telah ${action}`);
            fetchData();
          } catch (err) { Alert.alert("Gagal", "Terjadi kesalahan."); }
        }
      }
    ]);
  };

  const handleVerifyDonation = (id: number, action: 'verified' | 'rejected') => {
    Alert.alert("Verifikasi", `Tandai donasi ini sebagai ${action}?`, [
      { text: "Batal", style: "cancel" },
      { 
        text: "Konfirmasi", 
        onPress: async () => {
          try {
            await adminAPI.verifyDonation({ donasi_id: id, action });
            Alert.alert("Berhasil", "Status donasi diperbarui.");
            fetchData();
          } catch (err) { Alert.alert("Gagal", "Terjadi kesalahan."); }
        }
      }
    ]);
  };

  const renderShelterItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="business-outline" size={24} color={Colors.primary} />
        <Text style={styles.userName}>{item.username}</Text>
      </View>
      <Text style={styles.cardText}><Text style={{fontWeight:'bold'}}>Alasan:</Text> {item.alasan}</Text>
      <Text style={styles.cardText}><Text style={{fontWeight:'bold'}}>Lokasi:</Text> {item.lokasi}</Text>
      
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => handleVerifyShelter(item.id, 'ditolak')}>
          <Text style={styles.btnText}>Tolak</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => handleVerifyShelter(item.id, 'disetujui')}>
          <Text style={styles.btnText}>Setujui</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDonationItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.userName}>{item.nama_donatur} ➡️ {item.nama_shelter}</Text>
      <Text style={styles.amountText}>Rp {Number(item.nominal).toLocaleString()}</Text>
      
      {item.bukti_transfer && (
        <Image 
          source={{ uri: `${BASE_URL}${item.bukti_transfer}` }} 
          style={styles.buktiImage} 
          resizeMode="contain"
        />
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => handleVerifyDonation(item.id, 'rejected')}>
          <Text style={styles.btnText}>Tolak</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => handleVerifyDonation(item.id, 'verified')}>
          <Text style={styles.btnText}>Verifikasi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panel Admin</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'shelter' && styles.activeTab]} 
          onPress={() => setActiveTab('shelter')}
        >
          <Text style={[styles.tabText, activeTab === 'shelter' && styles.activeTabText]}>Shelter</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'donasi' && styles.activeTab]} 
          onPress={() => setActiveTab('donasi')}
        >
          <Text style={[styles.tabText, activeTab === 'donasi' && styles.activeTabText]}>Donasi</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={activeTab === 'shelter' ? renderShelterItem : renderDonationItem}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada antrian pengajuan.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: Colors.primary },
  tabText: { color: '#888', fontWeight: 'bold' },
  activeTabText: { color: Colors.primary },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userName: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  cardText: { fontSize: 13, color: '#666', marginBottom: 5 },
  amountText: { fontSize: 20, fontWeight: 'bold', color: '#2ecc71', marginVertical: 10 },
  buktiImage: { width: '100%', height: 200, borderRadius: 10, marginVertical: 10 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 },
  btn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8 },
  btnApprove: { backgroundColor: Colors.primary },
  btnReject: { backgroundColor: '#ff4d4d' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default AdminDashboard;