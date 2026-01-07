import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Modal, Image, Alert, ImageBackground, Platform, FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { getUserData } from '../services/api';

const API_URL = 'http://192.168.1.3:3000/api'; // Ganti dengan IP kamu

const FormRescue = () => {
  const router = useRouter();
  const [tags, setTags] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [image, setImage] = useState<any>(null);

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [waktuDisplay, setWaktuDisplay] = useState('');

  const [form, setForm] = useState({
    nama: '',
    telepon: '',
    waktu: new Date().toISOString(),
    lokasi: '',
    tag_id: '',
    tag_nama: '',
    deskripsi: ''
  });

  const fetchTags = async () => {
    try {
      const res = await axios.get(`${API_URL}/tags`);
      setTags(res.data?.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchTags(); }, []);

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') { setShowPicker(false); return; }
    if (selectedDate) {
      setDate(selectedDate);
      if (pickerMode === 'date') {
        setPickerMode('time');
        if (Platform.OS === 'android') {
          setShowPicker(false);
          setTimeout(() => setShowPicker(true), 100);
        }
      } else {
        setShowPicker(false);
        setPickerMode('date');
        setWaktuDisplay(selectedDate.toLocaleString('id-ID'));
        setForm({ ...form, waktu: selectedDate.toISOString() });
      }
    }
  };
  
  const checkAuth = async () => {
    const userData = await getUserData();
    if (!userData) {
      Alert.alert("Wajib Login", "Silakan login untuk mengakses fitur ini.");
      router.replace('/login');
    }
  };
  checkAuth();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const submitLaporan = async () => {
    const userData = await getUserData();
    if (!userData) {
        Alert.alert("Akses Ditolak", "Kamu harus login terlebih dahulu.");
        router.replace('/login');
        return;
      }
    if (!form.nama || !form.telepon || !form.tag_id || !form.lokasi) {
      Alert.alert("Peringatan", "Mohon isi semua data wajib!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nama_pelapor', form.nama);
      formData.append('telepon', form.telepon);
      formData.append('lokasi_penemuan', form.lokasi);
      formData.append('deskripsi', form.deskripsi);
      formData.append('tag_id', form.tag_id);
      formData.append('waktu_penemuan', form.waktu);
      formData.append("pengguna_id", String(userData.id)); 

      if (image) {
        formData.append('gambar', {
          uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
          name: 'rescue.jpg',
          type: 'image/jpeg',
        } as any);
      }

      await axios.post(`${API_URL}/rescue`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        router.replace('/rescue'); // Kembali ke tab rescue
      }, 1500);
    } catch (err) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengirim laporan.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Lapor Rescue 🐾</Text>
        
        <Text style={styles.label}>Nama Pelapor</Text>
        <TextInput style={styles.input} value={form.nama} onChangeText={(v) => setForm({ ...form, nama: v })} />

        <Text style={styles.label}>Lokasi Penemuan</Text>
        <TextInput style={styles.input} value={form.lokasi} onChangeText={(v) => setForm({ ...form, lokasi: v })} />

        <Text style={styles.label}>Kategori (Tag)</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowTagModal(true)}>
          <Text>{form.tag_nama || "Pilih kategori..."}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSubmit} onPress={submitLaporan}>
          <Text style={styles.btnText}>Kirim Laporan</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Tag & DateTimePicker (Sesuai kode Pau sebelumnya) */}
      {showPicker && <DateTimePicker value={date} mode={pickerMode} onChange={onDateChange} />}
    </View>
  );
};

export default FormRescue;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5E6' },
  scrollContainer: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FF8C00', textAlign: 'center', marginBottom: 20 },
  label: { fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  dropdown: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 },
  btnSubmit: { backgroundColor: '#FF8C00', padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});