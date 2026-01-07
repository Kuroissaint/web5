import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import RegionSelect from '../components/RegionSelect'; // Pastikan path komponen benar

const initialState = {
  namaKucing: "",
  jenisKelamin: "Jantan",
  warnaBulu: "",
  usia: "",
  sudahSteril: "0",
  deskripsi: "",
  fotos: [] as any[],
  namaPemilik: "",
  nohp: "",
  alamat: "",
  provinsiId: null as number | null,
  kabupatenKotaId: null as number | null,
  kecamatanId: null as number | null,
};

const FormAjuan = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk menerima data dari RegionSelect
  const handleRegionChange = (data: any) => {
    setForm(prev => ({
      ...prev,
      provinsiId: data.provinsiId,
      kabupatenKotaId: data.kotaId,
      kecamatanId: data.kecamatanId,
    }));
  };

  const pickImages = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert("Izin Ditolak", "Butuh akses galeri.");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.5,
    });

    if (!result.canceled) {
      setForm({ ...form, fotos: [...form.fotos, ...result.assets] });
    }
  };

  const removeImage = (index: number) => {
    const updated = [...form.fotos];
    updated.splice(index, 1);
    setForm({ ...form, fotos: updated });
  };

  const nextStep = () => {
    if (!form.namaPemilik || !form.nohp || !form.provinsiId) {
      return Alert.alert("Peringatan", "Mohon isi Nama, No HP, dan Lokasi.");
    }
    setCurrentStep(1);
  };

  const handleKirimForm = async () => {
    if (form.fotos.length === 0) return Alert.alert("Foto Kosong", "Minimal unggah 1 foto.");
    if (!form.namaKucing) return Alert.alert("Data Kurang", "Nama kucing wajib diisi.");

    setIsSubmitting(true);
    const formData = new FormData();
    
    formData.append("nama_lengkap", form.namaPemilik);
    formData.append("telepon", form.nohp);
    formData.append("alamat_lengkap", form.alamat);
    formData.append("provinsi_id", String(form.provinsiId));
    formData.append("kabupaten_kota_id", String(form.kabupatenKotaId));
    formData.append("kecamatan_id", String(form.kecamatanId));
    formData.append("namaKucing", form.namaKucing);
    formData.append("jenisKelamin", form.jenisKelamin);
    formData.append("usia", form.usia);
    formData.append("warnaBulu", form.warnaBulu);
    formData.append("deskripsi", form.deskripsi);
    formData.append("sudahSteril", form.sudahSteril);

    form.fotos.forEach((foto, index) => {
      const fileName = foto.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(fileName || '');
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      // @ts-ignore
      formData.append("foto", { uri: foto.uri, type: type, name: fileName || `photo_${index}.jpg` });
    });

    try {
      // FIX: Menghapus /api karena sudah ada di baseURL
      const response = await api.post('/pengajuan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      });

      if (response.data.success) {
        Alert.alert("Berhasil", "Data berhasil terkirim.", [
          { text: "OK", onPress: () => { setForm(initialState); router.replace('/(tabs)/adopt'); }}
        ]);
      }
    } catch (err: any) {
      Alert.alert("Gagal", "Terjadi kendala pada server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.judulForm}>Formulir Pengajuan Kucing 🐾</Text>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>hal {currentStep + 1} dari 2</Text></View>
        </View>

        {currentStep === 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle-outline" size={22} color="#a56c54" />
              <Text style={styles.subJudul}>Data Pemilik</Text>
            </View>
            
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput style={styles.input} onChangeText={(v)=>setForm({...form, namaPemilik:v})} value={form.namaPemilik}/>

            <Text style={styles.label}>WhatsApp / No HP</Text>
            <TextInput style={styles.input} keyboardType="phone-pad" onChangeText={(v)=>setForm({...form, nohp:v})} value={form.nohp}/>

            {/* INTEGRASI REGION SELECT */}
            <Text style={styles.label}>Wilayah</Text>
            <RegionSelect onRegionChange={handleRegionChange} />

            <Text style={styles.label}>Alamat Lengkap (Jalan/No Rumah)</Text>
            <TextInput style={styles.input} onChangeText={(v)=>setForm({...form, alamat:v})} value={form.alamat}/>

            <TouchableOpacity style={styles.btnMain} onPress={nextStep}>
              <Text style={styles.btnText}>Selanjutnya</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 1 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="paw-outline" size={22} color="#a56c54" />
              <Text style={styles.subJudul}>Detail Anabul</Text>
            </View>

            <Text style={styles.label}>Foto Kucing (Maks 5)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              <TouchableOpacity style={styles.addPhotoBox} onPress={pickImages}>
                <Ionicons name="camera-outline" size={30} color="#a56c54" />
              </TouchableOpacity>
              {form.fotos.map((item, index) => (
                <View key={index} style={styles.photoThumbWrapper}>
                  <Image source={{ uri: item.uri }} style={styles.photoThumb} />
                  <TouchableOpacity style={styles.removeIcon} onPress={() => removeImage(index)}>
                    <Ionicons name="close-circle" size={22} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <Text style={styles.label}>Nama Kucing</Text>
            <TextInput style={styles.input} placeholder="Luna / Cimot" onChangeText={(v)=>setForm({...form, namaKucing:v})} value={form.namaKucing}/>

            <View style={styles.row}>
                <View style={{flex:1, marginRight:10}}>
                    <Text style={styles.label}>Kelamin</Text>
                    <TextInput style={styles.input} placeholder="Jantan/Betina" onChangeText={(v)=>setForm({...form, jenisKelamin:v})} value={form.jenisKelamin}/>
                </View>
                <View style={{flex:1}}>
                    <Text style={styles.label}>Usia</Text>
                    <TextInput style={styles.input} placeholder="2 Thn" onChangeText={(v)=>setForm({...form, usia:v})} value={form.usia}/>
                </View>
            </View>

            <Text style={styles.label}>Deskripsi</Text>
            <TextInput style={[styles.input, {height: 80}]} multiline onChangeText={(v)=>setForm({...form, deskripsi:v})} value={form.deskripsi}/>

            <View style={styles.rowBtn}>
              <TouchableOpacity style={styles.btnBack} onPress={() => setCurrentStep(0)}>
                <Text>Kembali</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnKirim} onPress={handleKirimForm} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Kirim</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF9' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  header: { marginBottom: 25, alignItems: 'center' },
  judulForm: { fontSize: 22, fontWeight: '800', color: '#4d3a31' },
  stepBadge: { backgroundColor: '#FDF5F0', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: '#a56c54' },
  stepBadgeText: { fontSize: 11, color: '#a56c54', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 24, elevation: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 10 },
  subJudul: { fontSize: 16, fontWeight: '700', color: '#a56c54', marginLeft: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginTop: 15, marginBottom: 6 },
  input: { backgroundColor: '#F7F7F7', borderRadius: 14, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#EEE' },
  row: { flexDirection: 'row' },
  rowBtn: { flexDirection: 'row', gap: 10, marginTop: 30 },
  btnMain: { backgroundColor: '#a56c54', padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  btnKirim: { flex: 1, backgroundColor: '#a56c54', padding: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  btnBack: { padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#EEE', width: 100, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  photoScroll: { flexDirection: 'row', marginTop: 5 },
  addPhotoBox: { width: 90, height: 90, borderRadius: 18, borderStyle: 'dashed', borderWidth: 2, borderColor: '#a56c54', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  photoThumbWrapper: { position: 'relative', marginRight: 12 },
  photoThumb: { width: 90, height: 90, borderRadius: 18 },
  removeIcon: { position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 12 }
});

export default FormAjuan;