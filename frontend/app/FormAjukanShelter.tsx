import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

const FormDaftarShelter = () => {
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
  // 1. Validasi Input
  if (!form.namaShelter || !form.nik || !form.whatsapp || !image) {
    Alert.alert("Verifikasi Gagal", "Mohon lengkapi seluruh dokumen dan data identitas.");
    return;
  }

  setLoading(true);

  try {
    // 2. Siapkan FormData (Wajib untuk kirim file ke Fastify Multipart)
    const dataKirim = new FormData();
    dataKirim.append("pengguna_id", "1"); // Pastikan ini ada nilainya
    dataKirim.append("nama_shelter", form.namaShelter); // Gunakan snake_case
    dataKirim.append("penanggung_jawab", form.penanggungJawab);
    dataKirim.append("nik", form.nik);
    dataKirim.append("whatsapp", form.whatsapp);
    dataKirim.append("alamat", form.alamat);

    // 3. Olah Gambar
    const uriParts = image.split('.');
    const fileExtension = uriParts[uriParts.length - 1];
    const fileName = `berkas_${Date.now()}.${fileExtension}`;

    dataKirim.append("berkas_foto", {
      uri: Platform.OS === "android" ? image : image.replace("file://", ""),
      name: fileName,
      type: `image/${fileExtension}`,
    } as any);

    // 4. Tembak ke API Backend Fastify
    // GANTI IP_LAPTOP_KAMU dengan IP asli (contoh: 192.168.1.10)
    const response = await fetch("http://192.168.100.16:3000/api/ajukan-shelter", {
      method: "POST",
      body: dataKirim,
      headers: {
        "Accept": "application/json",
        // JANGAN set Content-Type manual saat pakai FormData, biar sistem yang buat boundary-nya
      },
    });

    const result = await response.json();

    if (response.ok && result.status === "success") {
      Alert.alert(
        "Permohonan Diterima",
        "Dokumen Anda telah masuk ke sistem antrian verifikasi. Tim admin akan meninjau dalam waktu 24 jam.",
        [{ text: "Pantau Status", onPress: () => router.back() }]
      );
    } else {
      Alert.alert("Error Server", result.message || "Gagal mengirim data.");
    }

  } catch (error) {
    console.error("Error Sending Data:", error);
    Alert.alert("Koneksi Gagal", "Tidak dapat terhubung ke server backend.");
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* TOP BAR & BANNER KEAMANAN */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#9E7363" />
          </TouchableOpacity>
          <View style={styles.badgeSecure}>
            <Ionicons name="shield-checkmark" size={14} color="#4CAF50" />
            <Text style={styles.badgeText}>Encrypted & Secure</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.mainTitle}>Verifikasi Akun Mitra</Text>
          <Text style={styles.subtitle}>
            Lengkapi dokumen berikut untuk mendapatkan lencana resmi dan akses panel manajemen shelter.
          </Text>

          {/* SECTION 1: PROFIL SHELTER */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="business" size={20} color="#9E7363" />
              <Text style={styles.sectionLabel}>Profil Organisasi</Text>
            </View>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Nama Resmi Shelter</Text>
             <TextInput 
                style={styles.input} 
                value={form.namaShelter} // <-- Tambahkan ini
                placeholder="Contoh: Shelter Anabul Sejahtera" 
                onChangeText={(txt) => setForm({...form, namaShelter: txt})}
                />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Nama Penanggung Jawab (Owner)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Sesuai KTP" 
                placeholderTextColor="#BBB"
                onChangeText={(txt) => setForm({...form, penanggungJawab: txt})}
              />
            </View>
          </View>

          {/* SECTION 2: KONTAK & LEGALITAS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#9E7363" />
              <Text style={styles.sectionLabel}>Legalitas & Kontak</Text>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Nomor NIK (16 Digit)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Masukkan 16 digit angka" 
                placeholderTextColor="#BBB"
                keyboardType="numeric"
                onChangeText={(txt) => setForm({...form, nik: txt})}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>WhatsApp Aktif</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Contoh: 0812xxxx" 
                placeholderTextColor="#BBB"
                keyboardType="phone-pad"
                onChangeText={(txt) => setForm({...form, whatsapp: txt})}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Alamat Fisik Shelter</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Tuliskan alamat lengkap bangunan shelter" 
                placeholderTextColor="#BBB"
                multiline 
                numberOfLines={3}
                onChangeText={(txt) => setForm({...form, alamat: txt})}
              />
            </View>
          </View>

          {/* SECTION 3: DOKUMEN PENDUKUNG */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Unggah Berkas KTP / Surat Izin</Text>
            <Text style={styles.uploadInfo}>Pastikan foto terlihat jelas dan tidak terpotong.</Text>
            
            <TouchableOpacity 
              style={[styles.uploadBox, image && styles.uploadBoxActive]} 
              onPress={pickImage}
            >
              {image ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                  <View style={styles.changeImageOverlay}>
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text style={styles.changeImageText}>Ganti Foto</Text>
                  </View>
                </View>
              ) : (
                <View style={{alignItems: 'center'}}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="cloud-upload" size={30} color="#9E7363" />
                  </View>
                  <Text style={styles.uploadText}>Ketuk untuk memilih dokumen</Text>
                  <Text style={styles.fileSizeInfo}>Format: JPG, PNG (Max. 5MB)</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && {backgroundColor: '#CCC'}]} 
            onPress={handleKirim}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Ajukan Verifikasi Sekarang</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.footerNote}>
            Dengan menekan tombol di atas, Anda menyetujui syarat dan ketentuan kemitraan serta bersedia memberikan data yang valid demi keamanan komunitas.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default FormDaftarShelter;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  backBtn: { padding: 10, backgroundColor: '#FFF', borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 },
  badgeSecure: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 10, color: '#4CAF50', fontWeight: 'bold', marginLeft: 5, textTransform: 'uppercase' },
  
  body: { padding: 25 },
  mainTitle: { fontSize: 26, fontWeight: '800', color: '#2D2D2D', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#777', lineHeight: 22, marginBottom: 30 },
  
  sectionCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#9E7363',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 10 },
  sectionLabel: { fontSize: 15, fontWeight: 'bold', color: '#444' },
  
  inputWrapper: { marginBottom: 15 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#9E7363', marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  textArea: { height: 100, textAlignVertical: 'top' },

  uploadInfo: { fontSize: 12, color: '#999', marginBottom: 15 },
  uploadBox: {
    height: 200,
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#EEE',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  uploadBoxActive: { borderStyle: 'solid', borderColor: '#9E7363' },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F3E0D2', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  uploadText: { color: '#444', fontWeight: '600', fontSize: 13 },
  fileSizeInfo: { color: '#BBB', fontSize: 11, marginTop: 4 },
  
  previewContainer: { width: '100%', height: '100%' },
  previewImage: { width: '100%', height: '100%' },
  changeImageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 8, gap: 5 },
  changeImageText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  submitBtn: {
    backgroundColor: '#9E7363',
    flexDirection: 'row',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
    elevation: 8,
    shadowColor: '#9E7363',
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerNote: { fontSize: 11, color: '#AAA', textAlign: 'center', marginTop: 25, lineHeight: 18, paddingHorizontal: 10 }
});