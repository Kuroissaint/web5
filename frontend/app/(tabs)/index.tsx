import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router'; 
import Hero from '../../components/HeroSection';
import InfoSection from '../../components/InfoSection';
import Navbar from '../../components/Navbar'; 
import { getUserData } from '../../services/api';

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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  welcomeTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  welcomeSub: { fontSize: 14, color: '#666', marginTop: 4 },
  content: {
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF8C00', // Warna orange khas Meowment
    marginBottom: 15,
    marginLeft: 5,
  },
  cardWrapper: {
    marginBottom: 20,
    // Di sini kamu bisa menambahkan shadow jika InfoSection belum memilikinya
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
});

export default HomeScreen;