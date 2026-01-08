import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router'; 
import Hero from '../../components/HeroSection';
import InfoSection from '../../components/InfoSection';
import Navbar from '../../components/Navbar'; 
import { getUserData } from '../../services/api';
import { Layout } from '../../constants/Layout';

const HomeScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState('Anabul Lover');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUserData(); // Mengambil data dari AsyncStorage
      if (userData && userData.username) {
        setUsername(userData.username);
      }
    };
    loadUser();
  }, []);


  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        
        {/* Tambahkan Greeting Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Halo, {username}!</Text> 
          <Text style={styles.welcomeSub}>Mari buat dunia lebih baik untuk anabul.</Text>
        </View>

        <Hero />

        {/* Gunakan View untuk membungkus section agar bisa diberi padding yang pas */}
        <View style={styles.content}>
          <Text style={styles.sectionHeader}>Program Kami</Text>
          
          <View style={styles.cardWrapper}>
            <InfoSection
              title="Rescue Center"
              text="Laporkan kucing liar di sekitarmu dan bantu mereka mendapatkan perawatan."
              image1={require('../../assets/section12.jpg')}   
              image2={require('../../assets/section11.jpg')} 
              btnText1="Lapor Rescue"
              btnText2="Donasi"
              onPress1={() => router.push('/rescue')}
              onPress2={() => router.push('/donate')}
            />
          </View>

          <View style={styles.cardWrapper}>
            <InfoSection
              title="Adopsi & Cari"
              text="Temukan majikan baru atau cari anabulmu yang hilang di sini."
              image1={require('../../assets/section21.jpg')}   
              image2={require('../../assets/section22.jpg')} 
              btnText1="Cari Kucing"
              btnText2="Adopsi Sekarang"
              onPress1={() => router.push('/search')}
              onPress2={() => router.push('/adopt')}
            />
          </View>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1 },
  welcomeSection: {
    paddingHorizontal: 16, // Disamakan dengan searchHeader
    paddingVertical: 12,   // Disamakan dengan searchHeader
    backgroundColor: '#fff',
  },
  welcomeTitle: { fontSize: 22, fontWeight: '900', color: '#333' }, // Disesuaikan sedikit lebih besar dari header biasa
  welcomeSub: { fontSize: 13, color: '#666', marginTop: 2 },
  content: {
    paddingHorizontal: 16, // Disamakan dengan listContainer di search
    paddingTop: 15,
  },
  sectionHeader: {
    fontSize: 18,          // Disamakan dengan headerTitle search
    fontWeight: '900',     // Disamakan dengan headerTitle search
    color: '#FF8C00', 
    marginBottom: 12,
  },
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 20,      // Konsisten dengan searchCard
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...Layout.shadow,      // Menggunakan shadow yang sama
  },
});

export default HomeScreen;