import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { shelterAPI } from "../services/api"; //
import { getUserData } from '../services/api';

const FormShelter = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    namaShelter: "",
    penanggungJawab: "",
    nik: "",
    alamat: "",
    whatsapp: "",
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleKirim = async () => {
    const userData = await getUserData();
    if (!userData) {
        Alert.alert("Akses Ditolak", "Kamu harus login terlebih dahulu.");
        router.replace('/login');
        return;
      }
    // Validasi input
    if (!form.namaShelter || !form.nik || !form.whatsapp || !image) {
      Alert.alert("Data Belum Lengkap", "Mohon isi semua data wajib dan unggah foto berkas.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("pengguna_id", String(userData.id)); // Sesuaikan dengan ID user yang login
      formData.append("nama_shelter", form.namaShelter);
      formData.append("penanggung_jawab", form.penanggungJawab);
      formData.append("nik", form.nik);
      formData.append("whatsapp", form.whatsapp);
      formData.append("alamat", form.alamat);

      const uriParts = image.split('.');
      const fileExtension = uriParts[uriParts.length - 1];
      const fileName = `shelter_${Date.now()}.${fileExtension}`;

      //
      formData.append("berkas_foto", {
        uri: Platform.OS === "android" ? image : image.replace("file://", ""),
        name: fileName,
        type: `image/${fileExtension}`,
      } as any);

      const response = await shelterAPI.ajukan(formData);

      if (response.data.success) {
        Alert.alert(
          "Berhasil Terkirim",
          "Permohonan kamu sedang diproses tim admin. Tunggu kabar selanjutnya ya!",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (error) {
      Alert.alert("Gagal", "Terjadi gangguan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FF8C00" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.mainTitle}>Daftar Shelter 🏡</Text>
          <Text style={styles.subtitle}>Bantu lebih banyak kucing dengan menjadi mitra shelter resmi Meowment.</Text>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Identitas Shelter</Text>
            <TextInput style={styles.input} placeholder="Nama Shelter" value={form.namaShelter} onChangeText={(t) => setForm({...form, namaShelter: t})} />
            <TextInput style={styles.input} placeholder="Nama Pemilik/Penanggung Jawab" onChangeText={(t) => setForm({...form, penanggungJawab: t})} />
            <TextInput style={styles.input} placeholder="Nomor WhatsApp" keyboardType="phone-pad" onChangeText={(t) => setForm({...form, whatsapp: t})} />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Legalitas & Lokasi</Text>
            <TextInput style={styles.input} placeholder="NIK (16 Digit)" keyboardType="numeric" onChangeText={(t) => setForm({...form, nik: t})} />
            <TextInput style={[styles.input, {height: 80}]} placeholder="Alamat Fisik Lengkap" multiline onChangeText={(t) => setForm({...form, alamat: t})} />
          </View>

          <Text style={styles.sectionLabel}>Unggah KTP / Surat Izin</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            {image ? <Image source={{ uri: image }} style={styles.preview} /> : (
              <View style={{alignItems:'center'}}>
                <Ionicons name="image-outline" size={40} color="#FF8C00" />
                <Text style={styles.uploadText}>Ketuk untuk pilih gambar</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handleKirim} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Kirim Permohonan</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default FormShelter;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { paddingTop: 50, paddingHorizontal: 20 },
  backBtn: { padding: 10, backgroundColor: '#FFF3E0', borderRadius: 12, alignSelf: 'flex-start' },
  body: { padding: 25 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 30 },
  sectionCard: { backgroundColor: '#FDFDFD', borderRadius: 15, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#F0F0F0' },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#FF8C00', marginBottom: 10, marginLeft: 5 },
  input: { backgroundColor: '#FAFAFA', borderRadius: 10, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  uploadBox: { height: 180, backgroundColor: '#FAFAFA', borderRadius: 15, borderStyle: 'dashed', borderWidth: 2, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center', marginBottom: 30, overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
  uploadText: { color: '#AAA', marginTop: 8, fontSize: 12 },
  submitBtn: { backgroundColor: '#FF8C00', padding: 18, borderRadius: 15, alignItems: 'center', elevation: 3 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});