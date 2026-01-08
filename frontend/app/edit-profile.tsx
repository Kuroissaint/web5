import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, BASE_URL } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const EditProfile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [username, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await AsyncStorage.getItem('user');
    if (data) {
      const parsed = JSON.parse(data);
      setUser(parsed);
      setNama(parsed.username);
      setNoHp(parsed.no_hp || "");
      if (parsed.foto) setImage(`${BASE_URL}${parsed.foto}`);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", user.id);
      formData.append("username", username);
      formData.append("no_hp", noHp);
      formData.append("existing_foto_profil", user.foto_profil || "");

      if (image && !image.startsWith('http')) {
        const fileName = image.split('/').pop();
        const match = /\.(\w+)$/.exec(fileName || '');
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        // @ts-ignore
        formData.append("foto_profil", { uri: image, name: fileName, type });
      }

      const res = await authAPI.updateProfile(formData);
      if (res.data.success) {
        // Simpan data terbaru ke storage agar Profile Tab otomatis update
        await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
        Alert.alert("Berhasil", "Profil diperbarui!");
        router.back();
      }
    } catch (err) {
      Alert.alert("Gagal", "Terjadi kesalahan.");
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.avatarPicker}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
        ) : (
          <Ionicons name="camera" size={40} color="#ccc" />
        )}
        <Text style={styles.changeText}>Ganti Foto</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Nama Lengkap</Text>
      <TextInput style={styles.input} value={username} onChangeText={setNama} />

      <Text style={styles.label}>Nomor WhatsApp</Text>
      <TextInput style={styles.input} value={noHp} onChangeText={setNoHp} keyboardType="phone-pad" />

      <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Simpan Perubahan</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 25 },
  avatarPicker: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  changeText: { color: '#9e7363', fontWeight: 'bold' },
  label: { fontSize: 14, color: '#888', marginBottom: 8 },
  input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  btnSave: { backgroundColor: '#9e7363', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});

export default EditProfile;