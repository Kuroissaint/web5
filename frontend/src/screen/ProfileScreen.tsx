import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      {/* Header Profil Sederhana */}
      <View style={styles.header}>
        <Ionicons name="person-circle" size={80} color="#FF8C00" />
        <Text style={styles.userName}>Nama Pengguna</Text>
      </View>

      {/* Menu List */}
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('AktivitasSaya')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="time-outline" size={24} color="#FF8C00" />
            <Text style={styles.menuText}>Aktivitas Saya</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="gray" />
        </TouchableOpacity>

        {/* Tambahkan menu lain di sini jika perlu */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { alignItems: 'center', padding: 40, backgroundColor: '#fff' },
  userName: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  menuContainer: { marginTop: 20 },
  menuItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  menuText: { fontSize: 16, marginLeft: 15 }
});

export default ProfileScreen;