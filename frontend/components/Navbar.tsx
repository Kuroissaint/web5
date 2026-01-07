import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Dimensions, Animated, Modal, ScrollView, Platform 
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const slideAnim = useState(new Animated.Value(width))[0];

  const checkLogin = async () => {
    const token = await AsyncStorage.getItem('token');
    const userStr = await AsyncStorage.getItem('user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      setIsLoggedIn(true);
      setUserName(user.username || user.email || 'Teman Meowment');
    } else {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLogin();
  }, [pathname]);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setIsLoggedIn(false);
    toggleMenu();
    router.replace('/auth/Login' as any);
  };

  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: width * 0.3,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsMenuOpen(false));
    }
  };

  const NavItem = ({ title, route, icon }: { title: string, route: string, icon: string }) => {
    const isActive = pathname === route;
    return (
      <TouchableOpacity 
        style={[styles.mobileNavItem, isActive && styles.activeNavItem]} 
        onPress={() => { toggleMenu(); router.push(route as any); }}
      >
        <Text style={[styles.mobileNavLink, isActive && styles.activeNavLink]}>
          {icon} {title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.navContainer}>
        {/* Logo */}
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text style={styles.logoText}>Meowment</Text>
        </TouchableOpacity>

        {/* Ikon di sebelah kanan */}
        <View style={styles.rightHeaderGroup}>
          {/* Tombol Pesawat Kertas (DM) */}
          <TouchableOpacity 
            style={styles.dmIconButton} 
            onPress={() => router.push('/ChatInbox')}
          >
            <Ionicons name="paper-plane-outline" size={24} color="#fffaf2" />
            {/* Titik Notifikasi Merah */}
            <View style={styles.badgeDot} />
          </TouchableOpacity>

          {/* Hamburger Menu */}
          <TouchableOpacity style={styles.hamburger} onPress={toggleMenu}>
            <View style={styles.bar} />
            <View style={[styles.bar, { width: 20 }]} />
            <View style={styles.bar} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sidebar Mobile Menu */}
      <Modal visible={isMenuOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={toggleMenu} />
        
        <Animated.View style={[styles.mobileMenu, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.mobileMenuContent}>
            
            <View style={styles.mobileAuth}>
              {!isLoggedIn ? (
                <>
                  <TouchableOpacity style={[styles.authBtn, styles.signinBtn]} onPress={() => { toggleMenu(); router.push('/auth/Login' as any); }}>
                    <Text style={styles.signinText}>Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.authBtn, styles.registerBtn]} onPress={() => { toggleMenu(); router.push('/auth/Register' as any); }}>
                    <Text style={styles.registerText}>Register</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.userInfo}>
                  <Text style={styles.welcomeText}>Halo, {userName}</Text>
                  <TouchableOpacity style={[styles.authBtn, styles.logoutBtn]} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <ScrollView style={styles.menuList}>
              <NavItem title="Home" route="/Home" icon="🏠" />
              <NavItem title="Rescue" route="/RescuePage" icon="🐾" />
              <NavItem title="Search" route="/Search" icon="🔍" />
              <NavItem title="Adopt" route="/Adopt" icon="❤️" />
              <NavItem title="Donate" route="/Donate" icon="💝" />
              {/* Menu Messages dihapus dari sini sesuai permintaan */}
            </ScrollView>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: '#3D2B24',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    zIndex: 1000,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9E7363',
  },
  rightHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15, // Jarak antara icon pesawat dan hamburger
  },
  dmIconButton: {
    position: 'relative',
    padding: 5,
  },
  badgeDot: {
    position: 'absolute',
    right: 2,
    top: 2,
    backgroundColor: '#ff6b6b',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3D2B24',
  },
  hamburger: {
    padding: 5,
  },
  bar: {
    width: 25,
    height: 3,
    backgroundColor: '#fffaf2',
    marginVertical: 2,
    borderRadius: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  mobileMenu: {
    position: 'absolute',
    right: 0,
    width: '75%',
    height: height,
    backgroundColor: '#3D2B24',
    paddingTop: 60,
    elevation: 10,
  },
  mobileMenuContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mobileAuth: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 20,
    marginBottom: 20,
  },
  authBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  signinBtn: { backgroundColor: '#fffaf2' },
  registerBtn: { backgroundColor: '#3D2B24', borderWidth: 1, borderColor: '#fffaf2' },
  logoutBtn: { backgroundColor: '#ff6b6b' },
  signinText: { color: '#3D2B24', fontWeight: 'bold' },
  registerText: { color: '#fffaf2', fontWeight: 'bold' },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  userInfo: { alignItems: 'center' },
  welcomeText: { color: '#fff', marginBottom: 10, fontWeight: '600' },
  menuList: { flex: 1 },
  mobileNavItem: {
    width: '100%',
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeNavItem: {
    backgroundColor: '#fffaf2',
  },
  mobileNavLink: {
    color: '#fff',
    fontSize: 16,
    padding: 15,
    fontWeight: '500',
  },
  activeNavLink: {
    color: '#3D2B24',
    fontWeight: 'bold',
  },
});

export default Navbar;