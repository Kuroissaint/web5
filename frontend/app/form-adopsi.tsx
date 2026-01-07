import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, SafeAreaView,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../services/api';
import RegionSelect from '../components/RegionSelect'; //
import { getUserData } from '../services/api';

const FormAdopsi = () => {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const user = await getUserData();
      if (!user) {
        Alert.alert("Wajib Login", "Silakan login terlebih dahulu untuk mengajukan kucing.");
        router.replace('/login');
      }
    };
    checkLogin();
  }, []);
  
  const params = useLocalSearchParams();
  const cat = typeof params.cat === 'string' ? JSON.parse(params.cat) : params.cat;

  const [form, setForm] = useState({
    namaLengkap: '',
    email: '',
    umur: '',
    nohp: '',
    pekerjaan: '',
    alamat: '',
    pernahPelihara: '',
    alasan: '',
    komitmen: false,
    provId: null as number | null,
    kabId: null as number | null,
    kecId: null as number | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegionChange = (data: any) => {
    setForm(prev => ({
      ...prev,
      provId: data.provinsiId,
      kabId: data.kotaId,
      kecId: data.kecamatanId,
    }));
  };

    const handleSubmit = async () => {
        // 1. Validasi awal
        if (!form.komitmen) return Alert.alert("Peringatan", "Harap setujui komitmen merawat.");
        if (!form.provId || !form.kabId || !form.kecId) return Alert.alert("Error", "Mohon lengkapi lokasi Anda.");

        // 2. Ambil data user yang sedang login
        const userData = await getUserData();

        if (!userData) {
        Alert.alert("Wajib Login", "Silakan login terlebih dahulu untuk mengajukan adopsi.");
        router.replace('/login');
        return;
        }

        setIsSubmitting(true);
        try {
        const payload = {
            // 3. Gunakan ID asli dari storage (pastikan key-nya sesuai backend: penggunaId atau pengguna_id)
            penggunaId: userData.id, 
            kucingId: cat?.id || 0,
            namaLengkap: form.namaLengkap,
            umur: parseInt(form.umur) || 0,
            alamat: form.alamat,
            nohp: form.nohp,
            pekerjaan: form.pekerjaan,
            pernahPelihara: form.pernahPelihara === 'Ya' ? 1 : 0,
            alasan: form.alasan,
            metodeBayar: "Transfer",
            provinsi_id: form.provId,
            kabupaten_kota_id: form.kabId,
            kecamatan_id: form.kecId,
        };

        // Mengirim data sebagai JSON (bukan FormData)
        const res = await api.post('/adopsi/submit', payload);
        
        if (res.data.success) {
            Alert.alert("Berhasil! 🎉", "Aplikasi adopsi Anda telah terkirim.");
            router.replace('/(tabs)/adopt');
        }
        } catch (err: any) {
        Alert.alert("Gagal", "Terjadi kesalahan pada server.");
        } finally {
        setIsSubmitting(false);
        }
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.judul}>Formulir Adopsi 🐾</Text>
            <Text style={styles.subJudul}>Melamar: {cat?.nama || "Anabul"}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Nama Lengkap *</Text>
            <TextInput style={styles.input} value={form.namaLengkap} onChangeText={(v)=>setForm({...form, namaLengkap:v})}/>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Umur</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={form.umur} onChangeText={(v)=>setForm({...form, umur:v})}/>
              </View>
              <View style={{ flex: 2 }}>
                <Text style={styles.label}>Pekerjaan</Text>
                <TextInput style={styles.input} value={form.pekerjaan} onChangeText={(v)=>setForm({...form, pekerjaan:v})}/>
              </View>
            </View>

            <Text style={styles.label}>No HP / WhatsApp *</Text>
            <TextInput style={styles.input} keyboardType="phone-pad" value={form.nohp} onChangeText={(v)=>setForm({...form, nohp:v})}/>

            {/* INTEGRASI REGION SELECT */}
            <Text style={styles.label}>Lokasi Tinggal</Text>
            <RegionSelect onRegionChange={handleRegionChange} />

            <Text style={styles.label}>Alamat Lengkap *</Text>
            <TextInput style={[styles.input, { height: 70 }]} multiline value={form.alamat} onChangeText={(v)=>setForm({...form, alamat:v})} />

            <Text style={styles.label}>Alasan ingin mengadopsi</Text>
            <TextInput style={[styles.input, { height: 80 }]} multiline value={form.alasan} onChangeText={(v)=>setForm({...form, alasan:v})} />
          </View>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setForm({...form, komitmen:!form.komitmen})}>
            <View style={[styles.checkbox, form.komitmen && styles.checkboxActive]} />
            <Text style={styles.checkboxText}>Saya berkomitmen merawat kucing ini dengan baik. *</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnSubmit, (!form.komitmen || isSubmitting) && {backgroundColor: '#ccc'}]} 
            onPress={handleSubmit} 
            disabled={!form.komitmen || isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Kirim Formulir</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7c58f' },
  container: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  judul: { fontSize: 26, fontWeight: 'bold', color: '#7c4f3a' },
  subJudul: { fontSize: 16, color: '#7c4f3a', marginTop: 5, fontWeight: '700' },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 20, elevation: 3 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 15, marginBottom: 8 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15 },
  row: { flexDirection: 'row' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 25, marginBottom: 30, gap: 10 },
  checkbox: { height: 20, width: 20, borderWidth: 2, borderColor: '#f7961d', borderRadius: 4 },
  checkboxActive: { backgroundColor: '#f7961d' },
  checkboxText: { flex: 1, fontSize: 13, color: '#333' },
  btnSubmit: { backgroundColor: '#f7961d', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 50 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default FormAdopsi;