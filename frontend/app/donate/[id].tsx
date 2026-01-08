import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { shelterAPI, BASE_URL } from '../../services/api'; // Pastikan shelterAPI sudah ada di api.ts

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

const DonateDetail = () => {
  const { id } = useLocalSearchParams(); // Ambil ID dari URL
  const [shelter, setShelter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const router = useRouter();

  // Ambil data shelter secara otomatis saat halaman dibuka
  useEffect(() => {
    const fetchShelter = async () => {
      try {
        const res = await shelterAPI.getShelterDetail(id as string);
        if (res.data.success) {
          setShelter(res.data.data);
        }
      } catch (err) {
        Alert.alert("Error", "Gagal mengambil informasi pembayaran shelter.");
      } finally {
        setLoading(false);
      }
    };
    fetchShelter();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#9e7363" />
      </View>
    );
  }

  const handleNext = () => {
    if (selectedAmount === 0) return Alert.alert("Peringatan", "Pilih nominal donasi terlebih dahulu.");
    router.push({
      pathname: '/donate/confirm',
      params: { 
        shelterId: shelter.id, 
        nominal: selectedAmount, 
        shelterName: shelter.username // Sesuaikan field 'username' atau 'nama'
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Gunakan optional chaining (?.) untuk menghindari crash jika data belum ada */}
      <Text style={styles.headerTitle}>Donasi ke {shelter?.username}</Text>
      
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
        {shelter?.qr_donasi ? (
          <Image 
            source={{ uri: `${BASE_URL}${shelter.qr_donasi}` }} 
            style={styles.qrisImage} 
            resizeMode="contain"
          />
        ) : (
          <View style={styles.noQrisContainer}>
            <Text style={styles.noQris}>QRIS belum tersedia untuk shelter ini.</Text>
          </View>
        )}
        <Text style={styles.qrisHint}>Silakan screenshot dan gunakan aplikasi M-Banking/E-Wallet Anda.</Text>
      </View>

      <TouchableOpacity style={styles.btnMain} onPress={handleNext}>
        <Text style={styles.btnText}>Saya Sudah Transfer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ... Styles tetap sama, tambahkan noQrisContainer jika perlu ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#9e7363', marginBottom: 25 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#555' },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  amountBtn: { width: '48%', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
  activeBtn: { backgroundColor: '#9e7363', borderColor: '#9e7363' },
  amountText: { color: '#333', fontWeight: 'bold' },
  activeText: { color: '#fff' },
  qrisContainer: { alignItems: 'center', backgroundColor: '#f9f9f9', padding: 20, borderRadius: 20 },
  qrisImage: { width: 250, height: 250 },
  noQrisContainer: { height: 250, justifyContent: 'center' },
  noQris: { color: '#999', textAlign: 'center' },
  qrisHint: { fontSize: 12, color: '#888', textAlign: 'center', marginTop: 15 },
  btnMain: { backgroundColor: '#9e7363', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default DonateDetail;