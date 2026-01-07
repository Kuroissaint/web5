import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { authAPI, BASE_URL } from '../../services/api';

const ProfileScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ reports: 0, donations: 0 }); // State untuk stats user

  const loadUser = useCallback(async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Jika dia user biasa, ambil data statistik (Contoh dummy, nanti hubungkan ke API)
      if (parsedUser.status === 'user') {
        fetchUserStats(parsedUser.id);
      }
    }
  }, []);

  const fetchUserStats = async (userId: number) => {
    // Simulasi fetch data dari backend
    // const res = await api.get(`/user/stats/${userId}`);
    setStats({ reports: 5, donations: 250000 }); // Contoh data dummy
  };

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  const handleLogout = async () => {
    Alert.alert("Keluar", "Apakah kamu yakin?", [
      { text: "Batal", style: "cancel" },
      { 
        text: "Keluar", 
        style: "destructive",
        onPress: async () => {
          await authAPI.logout(); 
          router.replace('/login'); 
        } 
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* 1. HEADER PROFIL (Sama untuk semua) */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.foto ? (
            <Image source={{ uri: `${BASE_URL}${user.foto}` }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle-outline" size={100} color={Colors.primary} />
          )}
        </View>
        <Text style={styles.userName}>{user?.username || 'Nama Pengguna'}</Text>
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{user?.status?.toUpperCase()}</Text>
        </View>
        
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
          <Text style={styles.editBtnText}>Edit Profil Umum</Text>
        </TouchableOpacity>
      </View>

      {/* 2. KONTEN BERDASARKAN STATUS */}
      {user?.status === 'user' ? (
        // --- TAMPILAN USER BIASA ---
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistik Kontribusi</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="megaphone-outline" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{stats.reports}</Text>
              <Text style={styles.statLabel}>Laporan Rescue</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="heart-outline" size={24} color="#e91e63" />
              <Text style={styles.statValue}>Rp {(stats.donations/1000).toLocaleString()}k</Text>
              <Text style={styles.statLabel}>Total Donasi</Text>
            </View>
          </View>
        </View>
      ) : (
        // --- TAMPILAN SHELTER ---
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informasi Shelter</Text>
            <TouchableOpacity onPress={() => router.push('/edit-shelter-detail')}>
                <Text style={{color: Colors.primary}}>Edit Detail</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.description}>
            {user?.deskripsi_shelter || "Belum ada deskripsi shelter. Tambahkan sekarang!"}
          </Text>

          <Text style={[styles.sectionTitle, {marginTop: 20}]}>QR Donasi</Text>
          <View style={styles.qrContainer}>
            {user?.qr_donasi ? (
                <Image source={{ uri: `${BASE_URL}${user.qr_donasi}` }} style={styles.qrImage} />
            ) : (
                <View style={styles.qrPlaceholder}>
                    <Ionicons name="qr-code-outline" size={50} color="#ccc" />
                    <Text style={{color: '#999'}}>Belum ada QR Code</Text>
                </View>
            )}
          </View>

          <Text style={[styles.sectionTitle, {marginTop: 20}]}>Galeri Shelter</Text>
          <View style={styles.galleryGrid}>
            {/* Map data foto dari backend di sini */}
            <TouchableOpacity style={styles.addPhotoBtn}>
                <Ionicons name="add" size={30} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 3. MENU NAVIGASI BAWAH */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/aktivitas')}>
          <View style={styles.menuLeft}>
            <Ionicons name="list-outline" size={24} color={Colors.primary} />
            <Text style={styles.menuText}>Aktivitas Saya</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        {user?.status === 'shelter' && (
             <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/ShelterDashboard')}>
             <View style={styles.menuLeft}>
               <Ionicons name="business-outline" size={24} color={Colors.primary} />
               <Text style={styles.menuText}>Dashboard Shelter</Text>
             </View>
             <Ionicons name="chevron-forward" size={20} color="#CCC" />
           </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.menuItem, {marginTop: 20}]} onPress={handleLogout}>
          <View style={styles.menuLeft}>
            <Ionicons name="log-out-outline" size={24} color="red" />
            <Text style={[styles.menuText, {color: 'red'}]}>Keluar Akun</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { 
    alignItems: 'center', 
    paddingVertical: 30, 
    backgroundColor: '#fff', 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    elevation: 3
  },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 10 },
  avatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  badge: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 5, marginBottom: 15 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  editBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.primary },
  editBtnText: { color: Colors.primary, fontSize: 14, fontWeight: 'bold' },

  section: { padding: 20, marginTop: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  
  // Stats Styles
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { backgroundColor: '#fff', width: '48%', padding: 15, borderRadius: 15, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 18, fontWeight: 'bold', marginVertical: 5 },
  statLabel: { fontSize: 12, color: '#777' },

  // Shelter Styles
  description: { color: '#666', lineHeight: 20, backgroundColor: '#fff', padding: 15, borderRadius: 10 },
  qrContainer: { alignItems: 'center', marginTop: 10 },
  qrImage: { width: 200, height: 200, borderRadius: 10 },
  qrPlaceholder: { width: 200, height: 200, backgroundColor: '#eee', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  addPhotoBtn: { width: 80, height: 80, backgroundColor: '#eee', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },

  menuContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuText: { marginLeft: 15, fontSize: 16, color: '#333' }
});

export default ProfileScreen;