import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '../../services/api';

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000]; // Dari Donate.vue

const DonateDetail = () => {
  const { shelter: shelterStr } = useLocalSearchParams();
  const shelter = JSON.parse(shelterStr as string);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (selectedAmount === 0) return Alert.alert("Peringatan", "Pilih nominal donasi terlebih dahulu.");
    router.push({
      pathname: '/donate/confirm',
      params: { shelterId: shelter.id, nominal: selectedAmount, shelterName: shelter.nama }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Donasi ke {shelter.nama}</Text>
      
      <Text style={styles.label}>1. Pilih Nominal</Text>
      <View style={styles.amountGrid}>
        {PRESET_AMOUNTS.map(amount => (
          <TouchableOpacity 
            key={amount}
            style={[styles.amountBtn, selectedAmount === amount && styles.activeBtn]}
            onPress={() => setSelectedAmount(amount)}
          >
            <Text style={[styles.amountText, selectedAmount === amount && styles.activeText]}>
              Rp{amount.toLocaleString('id-ID')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>2. Scan QRIS di Bawah</Text>
      <View style={styles.qrisContainer}>
        {shelter.qr_donasi ? (
          <Image 
            source={{ uri: `${BASE_URL}${shelter.qr_donasi}` }} 
            style={styles.qrisImage} 
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.noQris}>QRIS belum tersedia untuk shelter ini.</Text>
        )}
        <Text style={styles.qrisHint}>Silakan screenshot dan gunakan aplikasi M-Banking/E-Wallet Anda.</Text>
      </View>

      <TouchableOpacity style={styles.btnMain} onPress={handleNext}>
        <Text style={styles.btnText}>Saya Sudah Transfer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#9e7363', marginBottom: 25 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#555' },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  amountBtn: { 
    width: '48%', 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#eee', 
    alignItems: 'center' 
  },
  activeBtn: { backgroundColor: '#9e7363', borderColor: '#9e7363' },
  amountText: { color: '#333', fontWeight: 'bold' },
  activeText: { color: '#fff' },
  qrisContainer: { alignItems: 'center', backgroundColor: '#f9f9f9', padding: 20, borderRadius: 20 },
  qrisImage: { width: 250, height: 250 },
  noQris: { color: '#999', marginVertical: 40 },
  qrisHint: { fontSize: 12, color: '#888', textAlign: 'center', marginTop: 15 },
  btnMain: { backgroundColor: '#9e7363', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default DonateDetail;