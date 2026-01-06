import React, { useState, useEffect } from 'react';
import api, { BASE_URL, kucingAPI } from '../services/api'; // dari foldrz
import { useNavigation } from '@react-navigation/native';


import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Interface untuk tipe data lokasi dari API
interface LocationItem {
  id: string | number;
  nama_provinsi?: string;
  nama_kabupaten_kota?: string;
  nama_kecamatan?: string;
}


const initialState = {
  namaKucing: "",
  jenisKelamin: "Jantan",
  warnaBulu: "",
  usia: "",
  sudahSteril: "0",
  deskripsi: "",
  fotos: [],
  namaPemilik: "",
  nohp: "",
  alamat: "",
  provinsiId: "",
  kabupatenKotaId: "",
  kecamatanId: "",
};


const FormAjuan = () => {
  const navigation = useNavigation<any>(); // inisialisasi navigasi
  // ================= STATE SECTION =================
  
  // State untuk mengontrol langkah form (0: Data Pemilik, 1: Detail Kucing)
  const [currentStep, setCurrentStep] = useState(0);

  // State untuk menyimpan daftar pilihan lokasi dari API
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [kabupaten, setKabupaten] = useState<LocationItem[]>([]);
  const [kecamatan, setKecamatan] = useState<LocationItem[]>([]);

  // State Utama Form (Semua data disimpan di sini)
  const [form, setForm] = useState({
    namaKucing: "",
    jenisKelamin: "Jantan",
    warnaBulu: "",
    usia: "",
    sudahSteril: "0", // "1" untuk Ya, "0" untuk Belum
    deskripsi: "",
    fotos: [] as any[], // Menampung array objek foto dari gallery
   
    namaPemilik: "",
    nohp: "",
    alamat: "",
    provinsiId: "",
    kabupatenKotaId: "",
    kecamatanId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load provinsi saat komponen pertama kali dibuka
  useEffect(() => { loadProvinces(); }, []);

  // ================= LOGIKA FETCH LOKASI =================

  // Ambil data Provinsi
  const loadProvinces = async () => {
      try {
        const res = await api.get('/api/wilayah/provinsi');
        setProvinces(Array.isArray(res.data) ? res.data : (res.data.data || []));
      } catch (err) {
        console.error("Gagal load provinsi:", err);
      }
    };

  // Ambil data Kota berdasarkan ID Provinsi yang dipilih
  const loadKabupaten = async (provId: string) => {
      setForm({ ...form, provinsiId: provId, kabupatenKotaId: "", kecamatanId: "" });
      if (!provId) { setKabupaten([]); return; }
      try {
        const res = await api.get(`/api/wilayah/kota/${provId}`);
        setKabupaten(Array.isArray(res.data) ? res.data : (res.data.data || []));
      } catch (err) {
        console.error("Gagal load kota:", err);
      }
    };
    
  // Ambil data Kecamatan berdasarkan ID Kota yang dipilih
  const loadKecamatan = async (kabId: string) => {
      setForm({ ...form, kabupatenKotaId: kabId, kecamatanId: "" });
      if (!kabId) { setKecamatan([]); return; }
      try {
        const res = await api.get(`/api/wilayah/kecamatan/${kabId}`);
        setKecamatan(Array.isArray(res.data) ? res.data : (res.data.data || []));
      } catch (err) {
        console.error("Gagal load kecamatan:", err);
      }
    };

  // ================= LOGIKA MEDIA/FOTO =================

  // Fungsi untuk memilih banyak foto dari galeri
  const pickImages = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert("Izin Ditolak", "Butuh akses galeri untuk mengunggah foto.");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // AKTIFKAN MULTI PICK
      selectionLimit: 5, // Batas maksimal 5 foto
      quality: 0.5, // Kompres kualitas agar upload lebih ringan
    });

    if (!result.canceled) {
      // Gabungkan foto yang sudah ada dengan foto baru yang dipilih
      setForm({ ...form, fotos: [...form.fotos, ...result.assets] });
    }
  };

  // Fungsi menghapus foto dari daftar list preview
  const removeImage = (index: number) => {
    const updated = [...form.fotos];
    updated.splice(index, 1);
    setForm({ ...form, fotos: updated });
  };

  // ================= NAVIGASI FORM =================

  const nextStep = () => {
    if (!form.namaPemilik || !form.nohp || !form.provinsiId) {
      return Alert.alert("Peringatan", "Mohon isi Nama, No HP, dan Lokasi terlebih dahulu.");
    }
    setCurrentStep(1);
  };

  const prevStep = () => setCurrentStep(0);

  // ================= SUBMIT DATA (API) =================

  const handleKirimForm = async () => {
    // Validasi minimal
    if (form.fotos.length === 0) return Alert.alert("Foto Kosong", "Minimal unggah 1 foto kucing.");
    if (!form.namaKucing) return Alert.alert("Data Kurang", "Nama kucing wajib diisi.");

    setIsSubmitting(true);

    // Gunakan FormData karena kita mengirimkan file gambar
    const formData = new FormData();
    
    // 1. Masukkan semua data teks ke FormData
    formData.append("nama_lengkap", form.namaPemilik);
    formData.append("telepon", form.nohp);
    formData.append("alamat_lengkap", form.alamat);
    formData.append("provinsi_id", form.provinsiId);
    formData.append("kabupaten_kota_id", form.kabupatenKotaId);
    formData.append("kecamatan_id", form.kecamatanId);
    formData.append("namaKucing", form.namaKucing);
    formData.append("jenisKelamin", form.jenisKelamin);
    formData.append("usia", form.usia);
    formData.append("warnaBulu", form.warnaBulu);
    formData.append("deskripsi", form.deskripsi);
    formData.append("sudahSteril", form.sudahSteril);
    formData.append("pengguna_id", "1"); // ID User Dummy

    form.fotos.forEach((foto, index) => {
      const fileName = foto.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(fileName || '');
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      // @ts-ignore
      formData.append("foto", {
        uri: foto.uri,
        type: type,
        name: fileName || `photo_${index}.jpg`,
      });
    });

  try {
        const response = await api.post('/api/pengajuan', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          transformRequest: (data) => data, // Menjaga format FormData agar tidak rusak
        });

        if (response.status === 200 || response.status === 201) {
          Alert.alert(" Berhasil", "Data berhasil terkirim.", [
            { text: "OK", onPress: () => {
              setForm(initialState);
              setCurrentStep(0);
              // pindah ke hal adopt
              navigation.navigate('AdoptKucing');
            }}
          ]);
        }
      } catch (err: any) {
        console.error("Submit Error:", err.response?.data || err.message);
        Alert.alert("❌ Gagal", err.response?.data?.message || "Terjadi kendala pada server.");
      } finally {
        setIsSubmitting(false);
      }
    };

  // ================= RENDER UI =================

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER: Selalu Tampil (Tidak boleh dihapus) */}
        <View style={styles.header}>
          <Text style={styles.judulForm}>Formulir Pengajuan Kucing 🐾</Text>
          <Text style={styles.keteranganForm}>Bantu kucing Anda mendapatkan rumah baru yang penuh kasih sayang.</Text>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>hal {currentStep + 1} dari 2</Text>
          </View>
        </View>

        {/* --- LANGKAH 1: DATA PEMILIK --- */}
        {currentStep === 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle-outline" size={22} color="#a56c54" />
              <Text style={styles.subJudul}>Data Pemilik atau Pengaju</Text>
            </View>
            
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput style={styles.input}onChangeText={(v)=>setForm({...form, namaPemilik:v})} value={form.namaPemilik}/>

            <Text style={styles.label}>WhatsApp / No HP</Text>
            <TextInput style={styles.input} keyboardType="phone-pad"onChangeText={(v)=>setForm({...form, nohp:v})} value={form.nohp}/>

            {/* Picker Lokasi Bertingkat */}
            <Text style={styles.label}>Provinsi</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={form.provinsiId} onValueChange={(v)=>loadKabupaten(v)}>
                <Picker.Item label="Pilih Provinsi" value="" color="#999" />
                {provinces.map(p => <Picker.Item key={p.id} label={p.nama_provinsi} value={p.id}/>)}
              </Picker>
            </View>

            <Text style={styles.label}>Kabupaten / Kota</Text>
            <View style={[styles.pickerContainer, !form.provinsiId && styles.disabledPicker]}>
              <Picker selectedValue={form.kabupatenKotaId} onValueChange={(v)=>loadKecamatan(v)} enabled={!!form.provinsiId}>
                <Picker.Item label="Pilih Kota" value="" color="#999" />
                {kabupaten.map(k => <Picker.Item key={k.id} label={k.nama_kabupaten_kota} value={k.id}/>)}
              </Picker>
            </View>

            <Text style={styles.label}>Kecamatan</Text>
            <View style={[styles.pickerContainer, !form.kabupatenKotaId && styles.disabledPicker]}>
              <Picker selectedValue={form.kecamatanId} onValueChange={(v)=>setForm({...form, kecamatanId:v})} enabled={!!form.kabupatenKotaId}>
                <Picker.Item label="Pilih Kecamatan" value="" color="#999" />
                {kecamatan.map(kec => <Picker.Item key={kec.id} label={kec.nama_kecamatan} value={kec.id}/>)}
              </Picker>
            </View>
            

                <Text style={styles.label}>Alamat</Text>
            <TextInput style={styles.input} placeholder= "" onChangeText={(v)=>setForm({...form, alamat:v})} value={form.alamat}/>

            <TouchableOpacity style={styles.btnMain} onPress={nextStep}>
              <Text style={styles.btnText}>Selanjutnya</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* --- LANGKAH 2: DETAIL ANABUL --- */}
        {currentStep === 1 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="paw-outline" size={22} color="#a56c54" />
              <Text style={styles.subJudul}>Detail Anabul</Text>
            </View>

            {/* Unggah Banyak Foto */}
            <Text style={styles.label}>Foto-foto Kucing (Maks 5)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              <TouchableOpacity style={styles.addPhotoBox} onPress={pickImages}>
                <Ionicons name="camera-outline" size={30} color="#a56c54" />
                <Text style={{fontSize: 10, color: '#a56c54', fontWeight: 'bold'}}>Tambah</Text>
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
            <TextInput style={styles.input} placeholder="Contoh: Luna / Cimot" onChangeText={(v)=>setForm({...form, namaKucing:v})} value={form.namaKucing}/>

            <View style={styles.row}>
              <View style={{flex:1, marginRight:10}}>
                <Text style={styles.label}>Jenis Kelamin</Text>
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={form.jenisKelamin} onValueChange={(v)=>setForm({...form, jenisKelamin:v})}>
                    <Picker.Item label="Jantan" value="Jantan" />
                    <Picker.Item label="Betina" value="Betina" />
                  </Picker>
                </View>
              </View>
              <View style={{flex:1}}>
                <Text style={styles.label}>Sudah Steril?</Text>
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={form.sudahSteril} onValueChange={(v)=>setForm({...form, sudahSteril:v})}>
                    <Picker.Item label="Belum" value="0" />
                    <Picker.Item label="Sudah" value="1" />
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{flex:1, marginRight:10}}>
                <Text style={styles.label}>Perkiraan Usia</Text>
                <TextInput style={styles.input} placeholder="2 Thn / 5 Bln" onChangeText={(v)=>setForm({...form, usia:v})} value={form.usia}/>
              </View>
              <View style={{flex:1}}>
                <Text style={styles.label}>Warna Bulu</Text>
                <TextInput style={styles.input} placeholder="Orange / Putih" onChangeText={(v)=>setForm({...form, warnaBulu:v})} value={form.warnaBulu}/>
              </View>
            </View>



            <Text style={styles.label}>Deskripsi & Alasan Hibah</Text>
            <TextInput 
              style={[styles.input, {height: 80, textAlignVertical: 'top'}]} 
              multiline 
              placeholder="Ceritakan sifat kucing dan alasan dicarikan rumah baru..." 
              onChangeText={(v)=>setForm({...form, deskripsi:v})} 
              value={form.deskripsi}
            />

            <View style={styles.rowBtn}>
              <TouchableOpacity style={styles.btnBack} onPress={prevStep}>
                <Text style={{color: '#888', fontWeight: 'bold'}}>Kembali</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnKirim} onPress={handleKirimForm} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Kirim Form 🐾</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ================= STYLING SECTION =================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF9' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  header: { marginBottom: 25, alignItems: 'center' },
  judulForm: { fontSize: 22, fontWeight: '800', color: '#4d3a31', marginBottom: 8 },
  keteranganForm: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },
  stepBadge: { backgroundColor: '#FDF5F0', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: '#a56c54' },
  stepBadgeText: { fontSize: 11, color: '#a56c54', fontWeight: 'bold' },
  
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 24, elevation: 5, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 10 },
  subJudul: { fontSize: 16, fontWeight: '700', color: '#a56c54', marginLeft: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginTop: 15, marginBottom: 6 },
  input: { backgroundColor: '#F7F7F7', borderRadius: 14, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#EEE', color: '#333' },
  pickerContainer: { backgroundColor: '#F7F7F7', borderRadius: 14, borderWidth: 1, borderColor: '#EEE', marginTop: 5, overflow: 'hidden' },
  disabledPicker: { opacity: 0.5 },
  
  row: { flexDirection: 'row' },
  rowBtn: { flexDirection: 'row', gap: 10, marginTop: 30 },
  btnMain: { backgroundColor: '#a56c54', padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  btnKirim: { flex: 1, backgroundColor: '#a56c54', padding: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  btnBack: { padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#EEE', width: 100, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Styling Preview Foto
  photoScroll: { flexDirection: 'row', marginTop: 5 },
  addPhotoBox: { width: 90, height: 90, borderRadius: 18, borderStyle: 'dashed', borderWidth: 2, borderColor: '#a56c54', justifyContent: 'center', alignItems: 'center', marginRight: 10, backgroundColor: '#FDF5F0' },
  photoThumbWrapper: { position: 'relative', marginRight: 12 },
  photoThumb: { width: 90, height: 90, borderRadius: 18 },
  removeIcon: { position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 12 }
});

export default FormAjuan;