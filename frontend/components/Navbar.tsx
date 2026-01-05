import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api'; //

const Navbar = () => {
  const router = useRouter();
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Cek status login setiap Navbar muncul
  useEffect(() => {
    const checkStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    checkStatus();
  }, []);

  const handleLogout = async () => {
    setMenuVisible(false);
    await authAPI.logout(router); // Gunakan fungsi logout dari api.ts
  };

  const navigateTo = (path: string) => {
    setMenuVisible(false);
    router.push(path as any);
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.brandContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.brandText}>Meowment</Text>
      </View>
      
      {/* Tombol Burger Ikon */}
      <TouchableOpacity onPress={() => setMenuVisible(!isMenuVisible)}>
        <Ionicons name="menu-outline" size={30} color="#9e7363" />
      </TouchableOpacity>

      {/* Dropdown Menu Modal */}
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
                  <Ionicons name="person-outline" size={20} color="#313957" />
                  <Text style={styles.menuText}>Profil Saya</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/my-search')}>
                  <Ionicons name="document-text-outline" size={20} color="#313957" />
                  <Text style={styles.menuText}>Laporan Saya</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={20} color="#FF4D4D" />
                  <Text style={[styles.menuText, { color: '#FF4D4D' }]}>Keluar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/login')}>
                  <Ionicons name="log-in-outline" size={20} color="#313957" />
                  <Text style={styles.menuText}>Masuk</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/register')}>
                  <Ionicons name="person-add-outline" size={20} color="#313957" />
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
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 35, // Jarak status bar
    zIndex: 100,
  },
  brandContainer: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 35, height: 35, marginRight: 8 },
  brandText: { fontSize: 18, fontWeight: '800', color: '#9e7363' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  dropdown: {
    position: 'absolute',
    top: 100, // Menyesuaikan tinggi Navbar
    right: 20,
    backgroundColor: '#fff',
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
  menuText: { fontSize: 15, fontWeight: '600', color: '#313957' },
  divider: { height: 1, backgroundColor: '#F1F3F5', marginVertical: 5 },
});

export default Navbar;