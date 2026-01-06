import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { authAPI } from '../../services/api';

const ProfileScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Keluar",
      "Apakah kamu yakin ingin keluar dari akun?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Keluar", 
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Jalankan fungsi logout untuk hapus storage
              await authAPI.logout(); 
              
              // 2. Arahkan ke halaman login menggunakan Expo Router
              // Gunakan replace agar history navigasi terhapus
              router.replace('/login'); 
            } catch (error) {
              Alert.alert("Error", "Gagal melakukan logout.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Profil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={100} color={Colors.primary} />
        </View>
        <Text style={styles.userName}>{user?.nama || "Pencinta Anabul"}</Text>
        <Text style={styles.userEmail}>{user?.email || "user@meowment.com"}</Text>
      </View>

      {/* Menu List - Terinspirasi dari si P */}
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/aktivitas')}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="time-outline" size={24} color={Colors.primary} />
            <Text style={styles.menuText}>Aktivitas Adopsi Saya</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/my-search')}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="search-outline" size={24} color={Colors.primary} />
            <Text style={styles.menuText}>Laporan Kehilangan Saya</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        {/* Tombol Logout */}
        <TouchableOpacity 
        style={[styles.menuItem, {marginTop: 20}]} 
        onPress={handleLogout} // Panggil fungsi handleLogout
        >
        <View style={styles.menuLeft}>
            <Ionicons name="log-out-outline" size={24} color="red" />
            <Text style={[styles.menuText, {color: 'red'}]}>Keluar Akun</Text>
        </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatarContainer: { marginBottom: 10 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#777' },
  menuContainer: { marginTop: 15 },
  menuItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 18, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1'
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  menuText: { fontSize: 16, fontWeight: '500', color: '#444' }
});

export default ProfileScreen;