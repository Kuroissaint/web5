import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image 
} from 'react-native';

const TopTab = createMaterialTopTabNavigator();

// --- 1. KOMPONEN TAB "ADOPSI SAYA" (Sisi kamu sebagai pencari kucing) ---
const AdopsiSayaTab = () => (
  <View style={styles.centerContent}>
    <Text>Di sini nanti muncul status kucing yang kamu lamar.</Text>
  </View>
);

// --- 2. KOMPONEN TAB "KUCING SAYA" (Sisi kamu sebagai pemilik kucing) ---
// Kita tambahkan parameter { navigation } supaya bisa pindah halaman nanti
const KucingSayaTab = ({ navigation }: any) => {
  
  // Data Dummy: Contoh daftar kucing yang kamu miliki
  // Dalam aplikasi asli, data ini nanti diambil dari tabel 'kucing' di database
  const myCatsData = [
    { 
      id: '1', 
      namaKucing: 'Mimum', 
      jumlahPelamar: 3, 
      gambar: 'https://placekitten.com/200/200' 
    },
    { 
      id: '2', 
      namaKucing: 'Miyua', 
      jumlahPelamar: 1, 
      gambar: 'https://placekitten.com/201/201' 
    },
  ];

  return (
    <View style={styles.tabContainer}>
      <Text style={styles.sectionTitle}>Daftar Kucing Milikmu</Text>
      
      {/* FlatList digunakan untuk membuat daftar yang bisa di-scroll dengan efisien */}
      <FlatList
        data={myCatsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // TouchableOpacity membuat kartu bisa diklik
          <TouchableOpacity 
            style={styles.catCard}
            onPress={() => alert(`Membuka pelamar untuk ${item.namaKucing}`)}
          >
            {/* Menampilkan foto kucing */}
            <Image source={{ uri: item.gambar }} style={styles.catImage} />
            
            <View style={styles.catInfo}>
              <Text style={styles.catNameText}>{item.namaKucing}</Text>
              
              {/* Badge penanda jumlah orang yang mengisi form adopsi */}
              <View style={styles.applicantBadge}>
                <Text style={styles.applicantText}>{item.jumlahPelamar} Pelamar</Text>
              </View>
            </View>

            {/* Simbol panah untuk estetika navigasi */}
            <Text style={styles.arrowIcon}> {'>'} </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// --- 3. KOMPONEN UTAMA (Navigasi Atas) ---
export default function AktivitasSaya() {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF8C00', // Warna teks tab saat aktif (Orange)
        tabBarIndicatorStyle: { backgroundColor: '#FF8C00' }, // Warna garis bawah tab
        tabBarLabelStyle: { fontWeight: 'bold', fontSize: 13 }, // Gaya tulisan label tab
      }}
    >
      <TopTab.Screen name="Adopsi Saya" component={AdopsiSayaTab} />
      <TopTab.Screen name="Kucing Saya" component={KucingSayaTab} />
    </TopTab.Navigator>
  );
}

// --- 4. GAYA TAMPILAN (STYLING) ---
const styles = StyleSheet.create({
  centerContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  tabContainer: { 
    flex: 1, 
    backgroundColor: '#f9f9f9', 
    padding: 15 
  },
  sectionTitle: { 
    fontSize: 14, 
    color: '#777', 
    marginBottom: 15, 
    fontWeight: '600' 
  },
  catCard: { 
    flexDirection: 'row', // Foto dan teks berjejer ke samping
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 12,
    alignItems: 'center',
    // Efek bayangan (Shadow) agar kartu terlihat timbul
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  catImage: { 
    width: 60, 
    height: 60, 
    borderRadius: 30 // Membuat foto jadi bulat
  },
  catInfo: { 
    flex: 1, 
    marginLeft: 15 
  },
  catNameText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  applicantBadge: { 
    backgroundColor: '#FFF0E0', // Warna background orange muda
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6, 
    marginTop: 5,
    alignSelf: 'flex-start' // Lebar kotak mengikuti isi teks
  },
  applicantText: { 
    color: '#FF8C00', 
    fontSize: 11, 
    fontWeight: 'bold' 
  },
  arrowIcon: { 
    color: '#CCC', 
    fontSize: 18, 
    fontWeight: 'bold' 
  }
}); 








