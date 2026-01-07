import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; // Untuk refresh data otomatis
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { authAPI, BASE_URL } from '../../services/api';

const ProfileScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // Fungsi untuk load data user dari storage
  const loadUser = useCallback(async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // useFocusEffect akan menjalankan loadUser setiap kali kita masuk ke tab Profile
  // (Sangat berguna setelah kita balik dari halaman Edit Profile)
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
          try {
            await authAPI.logout(); 
            router.replace('/login'); 
          } catch (error) {
            console.error(error);
          }
        } 
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Bagian Avatar */}
        <View style={styles.avatarContainer}>
          {user?.foto ? (
            <Image 
              source={{ uri: `${BASE_URL}${user.foto}` }} 
              style={styles.avatar} 
            />
          ) : (
            <Ionicons name="person-circle-outline" size={100} color={Colors.primary} />
          )}
        </View>

        <Text style={styles.userName}>{user?.nama || 'Nama Pengguna'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>

        {/* TOMBOL EDIT PROFIL */}
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => router.push('/edit-profile')}
        >
          <Text style={styles.editBtnText}>Edit Profil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/aktivitas')}>
          <View style={styles.menuLeft}>
            <Ionicons name="list-outline" size={24} color={Colors.primary} />
            <Text style={styles.menuText}>Aktivitas Saya</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/my-search')}>
          <View style={styles.menuLeft}>
            <Ionicons name="search-outline" size={24} color={Colors.primary} />
            <Text style={styles.menuText}>Laporan Kehilangan Saya</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, {marginTop: 20}]} onPress={handleLogout}>
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
  header: { 
    alignItems: 'center', 
    paddingVertical: 30, 
    backgroundColor: '#fff', 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    elevation: 2
  },
  avatarContainer: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#eee', 
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 10
  },
  avatar: { 
    width: '100%', 
    height: '100%',
    resizeMode: 'cover'
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#777', marginBottom: 15 },
  
  // STYLE YANG TADI HILANG
  editBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#fff'
  },
  editBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold'
  },

  menuContainer: { marginTop: 15, paddingHorizontal: 20 },
  menuItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuText: { marginLeft: 15, fontSize: 16, color: '#333' }
});

export default ProfileScreen;