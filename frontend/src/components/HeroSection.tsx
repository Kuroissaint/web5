import React from 'react';
import { View, Text, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { Button } from './Button'; // Gunakan komponen Button yang kita buat tadi

const { width } = Dimensions.get('window');

const HeroSection = () => {
  return (
    <ImageBackground 
      source={require('../assets/hero-bg.jpg')} // Sesuaikan path asset
      style={styles.heroContainer}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Meowment 🐾</Text>
        <Text style={styles.subtitle}>Temukan Teman Berbulu di Sekitarmu</Text>
        <Button 
          title="Mulai Sekarang" 
          onPress={() => {}} 
          style={{ width: width * 0.6 }}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  heroContainer: { width: '100%', height: 400, justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 18, color: '#fff', textAlign: 'center', marginTop: 10, marginBottom: 20 },
});

export default HeroSection;