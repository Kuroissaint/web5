import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Hero from '../components/HeroSection';
import InfoSection from '../components/InfoSection';
import Navbar from '../components/Navbar'; // Jika kamu sudah buat Navbar tadi
import FooterSection from '../components/FooterSection';

const HomeScreen = ({ navigation }: any) => {
  return (
    <ScrollView style={styles.container}>
      <Navbar />
      
      <Hero />

      <InfoSection
        title="Bantu Kucing Liar Menemukan Rumahnya"
        text="Selamatkan kucing liar tak terurus di daerah sekitar, laporkan dan bantu kami untuk menekan populasi kucing liar di Indonesia."
        image1={require('../assets/section12.jpg')}   
        image2={require('../assets/section11.jpg')} 
        btnText1="Ke Halaman Rescue"
        btnText2="Ke Halaman Donate"
        onPress1={() => navigation.navigate('Rescue')}
        onPress2={() => navigation.navigate('Donate')}
      />

      <InfoSection
        title="Bantu Para Majikan Kembali Kepada Babunya"
        text="Mari berkontribusi mengembalikan senyuman para Babu Anabul yang kehilangan majikannya"
        image1={require('../assets/section21.jpg')}   
        image2={require('../assets/section22.jpg')} 
        btnText1="Ke Halaman Search"
        btnText2="Ke Halaman Adopt"
        onPress1={() => navigation.navigate('Search')}
        onPress2={() => navigation.navigate('Adopt')}
      />

      <FooterSection />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fc' },
});

export default HomeScreen;