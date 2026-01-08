import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, BASE_URL } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const EditShelterDetail = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [deskripsi, setDeskripsi] = useState("");
  const [qrImage, setQrImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await AsyncStorage.getItem('user');
    if (data) {
      const parsed = JSON.parse(data);
      setUser(parsed);
      setDeskripsi(parsed.deskripsi_shelter || "");
      if (parsed.qr_donasi) setQrImage(`${BASE_URL}${parsed.qr_donasi}`);
    }
  };

  const pickQR = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled) setQrImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      // Kirim field yang diperlukan backend (status, deskripsi, qr)
      formData.append("deskripsi_shelter", deskripsi);
      formData.append("existing_qr_donasi", user.qr_donasi || "");

      if (qrImage && !qrImage.startsWith('http')) {
        const fileName = qrImage.split('/').pop();
        const match = /\.(\w+)$/.exec(fileName || '');
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        // @ts-ignore
        formData.append("qr_donasi", { uri: qrImage, name: fileName, type });
      }

      const res = await authAPI.updateProfile(formData);
      if (res.data.success) {
        await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
        Alert.alert("Berhasil", "Detail shelter diperbarui!");
        router.back();
      }
    } catch (err) {
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan.");
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Informasi Shelter</Text>

      <Text style={styles.label}>Deskripsi Shelter</Text>
      <TextInput 
        style={[styles.input, { height: 120, textAlignVertical: 'top' }]} 
        value={deskripsi} 
        onChangeText={setDeskripsi} 
        multiline
        placeholder="Tuliskan profil shelter Anda..."
      />

      <Text style={styles.label}>Update QR Code Donasi</Text>
      <TouchableOpacity onPress={pickQR} style={styles.qrPicker}>
        {qrImage ? (
          <Image source={{ uri: qrImage }} style={styles.qrPreview} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="qr-code-outline" size={50} color="#ccc" />
            <Text style={{color: '#999'}}>Pilih Gambar QRIS</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Simpan Detail Shelter</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 25 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 14, color: '#888', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  qrPicker: { alignItems: 'center', marginBottom: 30 },
  qrPreview: { width: 250, height: 250, borderRadius: 15 },
  placeholder: { width: 250, height: 250, backgroundColor: '#f0f0f0', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
  btnSave: { backgroundColor: '#9e7363', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 50 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});

export default EditShelterDetail;