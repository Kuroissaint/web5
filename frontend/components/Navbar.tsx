import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { Colors } from '../constants/Colors'; // 1. Import Colors dari constant

const Navbar = () => {
  const router = useRouter();
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    checkStatus();
  }, []);

  const handleLogout = async () => {
    setMenuVisible(false);
    try {
      await authAPI.logout();
      router.replace('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigateTo = (path: string) => {
    setMenuVisible(false);
    router.push(path as any);
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.brandContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        {/* 2. Warna teks brand diubah ke putih agar kontras dengan latar cokelat */}
        <Text style={styles.brandText}>Meowment</Text>
      </View>
      
      {/* 3. Ikon Burger diubah ke putih */}
      <TouchableOpacity onPress={() => setMenuVisible(!isMenuVisible)}>
        <Ionicons name="menu-outline" size={30} color={Colors.white} />
      </TouchableOpacity>

      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.dropdown}>
            {isLoggedIn ? (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/profile')}>
                  <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
                  <Text style={styles.menuText}>Profil Saya</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/my-search')}>
                  <Ionicons name="document-text-outline" size={20} color={Colors.textSecondary} />
                  <Text style={styles.menuText}>Laporan Saya</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                  <Text style={[styles.menuText, { color: Colors.error }]}>Keluar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/login')}>
                  <Ionicons name="log-in-outline" size={20} color={Colors.textSecondary} />
                  <Text style={styles.menuText}>Masuk</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/register')}>
                  <Ionicons name="person-add-outline" size={20} color={Colors.textSecondary} />
                  <Text style={styles.menuText}>Daftar Akun</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    paddingTop: 45,
    height: 100,
    backgroundColor: Colors.primary, // 4. Menggunakan Cokelat Meowment dari constant
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  brandContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginTop: 5,
  },
  logo: { width: 35, height: 35, marginRight: 8 },
  brandText: { fontSize: 18, fontWeight: '800', color: Colors.white }, // Putih untuk teks brand
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  dropdown: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: Colors.white, // Latar dropdown tetap putih agar teks isi menu terbaca
    borderRadius: 15,
    padding: 10,
    width: 200,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 12,
  },
  menuText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary }, // Warna teks menu sekunder
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 5 }, // Warna pembatas dari constant
});

export default Navbar;