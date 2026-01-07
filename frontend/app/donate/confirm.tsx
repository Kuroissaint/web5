import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { donasiAPI } from '../../services/api';

const DonateConfirm = () => {
  const { shelterId, nominal, shelterName } = useLocalSearchParams();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [keterangan, setKeterangan] = useState("");
  const router = useRouter();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!image) return Alert.alert("Error", "Mohon unggah bukti transfer.");
    
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = JSON.parse(userStr || '{}');

      const formData = new FormData();
      formData.append("donatur_id", user.id);
      formData.append("shelter_id", shelterId as string);
      formData.append("nominal", nominal as string);
      formData.append("keterangan", keterangan);

      const fileName = image.split('/').pop();
      const match = /\.(\w+)$/.exec(fileName || '');
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      // @ts-ignore
      formData.append("bukti", { uri: image, name: fileName, type });

      await donasiAPI.submitDonasi(formData); //
      Alert.alert("Berhasil!", "Donasi Anda sedang diverifikasi oleh shelter.", [
        { text: "OK", onPress: () => router.replace('/(tabs)/adopt') }
      ]);
    } catch (err) {
      Alert.alert("Gagal", "Terjadi kesalahan saat mengirim bukti.");
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Konfirmasi Donasi</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.sumLabel}>Shelter Penerima:</Text>
        <Text style={styles.sumValue}>{shelterName}</Text>
        <Text style={[styles.sumLabel, {marginTop: 10}]}>Nominal:</Text>
        <Text style={styles.sumValue}>Rp{Number(nominal).toLocaleString('id-ID')}</Text>
      </View>

      <Text style={styles.label}>Unggah Bukti Transfer</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.preview} />
        ) : (
          <Text style={{color: '#999'}}>Ketuk untuk pilih foto</Text>
        )}
      </TouchableOpacity>

      <TextInput 
        style={styles.input} 
        placeholder="Pesan tambahan (opsional)" 
        multiline
        value={keterangan}
        onChangeText={setKeterangan}
      />

      <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Kirim Bukti</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  summaryCard: { backgroundColor: '#FDF5F0', padding: 20, borderRadius: 15, marginBottom: 25 },
  sumLabel: { fontSize: 13, color: '#888' },
  sumValue: { fontSize: 18, fontWeight: 'bold', color: '#9e7363' },
  label: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  uploadBox: { width: '100%', height: 200, backgroundColor: '#f9f9f9', borderRadius: 15, borderStyle: 'dashed', borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
  input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12, marginTop: 20, minHeight: 80, textAlignVertical: 'top' },
  btnSubmit: { backgroundColor: '#9e7363', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});

export default DonateConfirm;