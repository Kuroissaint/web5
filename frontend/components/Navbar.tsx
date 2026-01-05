import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, ChatService } from '../services/api'; 

const Navbar = () => {
  const router = useRouter();
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Cek status login & Ambil data unread messages
  useEffect(() => {
    const checkStatusAndNotifications = async () => {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user'); // Ambil data user dari storage
      
      if (token && userData) {
        setIsLoggedIn(true);
        const user = JSON.parse(userData);
        
        // Ambil data inbox untuk menghitung total unread
        try {
          const response = await ChatService.getConversations(user.id);
          const totalUnread = response.data.reduce((acc: number, curr: any) => acc + (curr.unread_count || 0), 0);
          setUnreadCount(totalUnread);
        } catch (err) {
          console.log("Gagal mengambil notifikasi chat", err);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkStatusAndNotifications();
    
    // Opsional: Lakukan polling setiap 30 detik agar angka terupdate otomatis
    const interval = setInterval(checkStatusAndNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    setMenuVisible(false);
    await authAPI.logout(router); 
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
      
      {/* Tombol Burger dengan Indikator Titik Merah jika ada pesan baru */}
      <TouchableOpacity onPress={() => setMenuVisible(!isMenuVisible)} style={styles.burgerContainer}>
        <Ionicons name="menu-outline" size={30} color="#9e7363" />
        {unreadCount > 0 && <View style={styles.dotBadge} />}
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
                  <Ionicons name="person-outline" size={20} color="#313957" />
                  <Text style={styles.menuText}>Profil Saya</Text>
                </TouchableOpacity>

                {/* --- MENU PESAN CHAT DENGAN BADGE ANGKA --- */}
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/chat')}>
                  <View style={styles.iconWithBadge}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#313957" />
                    {unreadCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.menuText}>Pesan Chat</Text>
                </TouchableOpacity>
                {/* ------------------------------------------- */}

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
    marginTop: 35, 
    zIndex: 100,
  },
  brandContainer: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 35, height: 35, marginRight: 8 },
  brandText: { fontSize: 18, fontWeight: '800', color: '#9e7363' },
  burgerContainer: { position: 'relative' },
  dotBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 10,
    height: 10,
    backgroundColor: '#FF4D4D',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  dropdown: {
    position: 'absolute',
    top: 100, 
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    width: 220,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  iconWithBadge: {
    position: 'relative',
    width: 25,
    height: 25,
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4D4D',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  menuText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#313957',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
  },
});

export default Navbar;