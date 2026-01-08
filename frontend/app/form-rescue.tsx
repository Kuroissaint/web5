// app/form-rescue.tsx

import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Modal, Image, Alert, Platform, FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons'; // Tambahkan icon
import api, { getUserData, BASE_URL } from '../services/api'; // Gunakan API terpusat

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
    waktu: new Date().toISOString(),
    lokasi: '',
    tag_id: '',
    tag_nama: '',
    deskripsi: ''
  });

  const fetchTags = async () => {
    try {
      const res = await api.get('/tags'); // Gunakan rute yang benar
      setTags(res.data?.data || []);
    } catch (err) { console.error("Gagal ambil tags:", err); }
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    if (!form.tag_id || !form.lokasi) {
        Alert.alert("Peringatan", "Mohon isi lokasi dan kategori kejadian!");
        return;
      }

    try {
      const formData = new FormData();
      formData.append('nama_pelapor', userData.username); // Menggunakan username
      formData.append('telepon', userData.no_hp || '');
      formData.append('lokasi_penemuan', form.lokasi);
      formData.append('deskripsi', form.deskripsi);
      formData.append('tag_id', form.tag_id);
      formData.append('waktu_penemuan', form.waktu);
      formData.append("pengguna_id", String(userData.id)); 
      formData.append("kategori", "rescue"); // Tambahkan kategori sesuai diskusi sebelumnya

      if (image) {
        const fileName = image.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(fileName || '');
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        
        // @ts-ignore
        formData.append('gambar', {
          uri: image.uri,
          name: fileName || 'rescue.jpg',
          type: type,
        });
      }

      await api.post('/rescue', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      });

      Alert.alert("Berhasil", "Laporan rescue berhasil dikirim!");
      router.replace('/(tabs)/rescue');
    } catch (err) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengirim laporan.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Lapor Rescue 🐾</Text>
        
        {/* INPUT GAMBAR (TAMBAHAN) */}
        <Text style={styles.label}>Foto Kucing/Kejadian</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={40} color="#999" />
              <Text style={{color: '#999'}}>Pilih Foto</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Waktu Penemuan</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
          <Text>{waktuDisplay || "Pilih waktu..."}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Lokasi Penemuan</Text>
        <TextInput style={styles.input} value={form.lokasi} onChangeText={(v) => setForm({ ...form, lokasi: v })} />

        <Text style={styles.label}>Kategori (Tag)</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowTagModal(true)}>
          <Text>{form.tag_nama || "Pilih kategori..."}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Deskripsi Kejadian</Text>
        <TextInput 
          style={[styles.input, {height: 100, textAlignVertical: 'top'}]} 
          multiline 
          value={form.deskripsi} 
          onChangeText={(v) => setForm({ ...form, deskripsi: v })} 
        />

        <TouchableOpacity style={styles.btnSubmit} onPress={submitLaporan}>
          <Text style={styles.btnText}>Kirim Laporan</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL PILIH TAG */}
      <Modal visible={showTagModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Kategori</Text>
            <FlatList
              data={tags}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.tagItem} 
                  onPress={() => {
                    setForm({ ...form, tag_id: item.id, tag_nama: item.nama_tag });
                    setShowTagModal(false);
                  }}
                >
                  <Text>{item.nama_tag}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowTagModal(false)} style={styles.btnClose}>
              <Text style={{color: '#fff'}}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showPicker && <DateTimePicker value={date} mode={pickerMode} is24Hour={true} onChange={onDateChange} />}
    </View>
  );
};

export default FormRescue;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF9' },
  scrollContainer: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FF8C00', textAlign: 'center', marginBottom: 20 },
  label: { fontWeight: 'bold', color: '#555', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 14, fontSize: 15 },
  dropdown: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 14 },
  
  // Style Image Picker
  imagePicker: { 
    height: 180, 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: '#eee', 
    borderStyle: 'dashed',
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden'
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { alignItems: 'center' },
  
  btnSubmit: { backgroundColor: '#FF8C00', padding: 18, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  tagItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  btnClose: { backgroundColor: '#FF8C00', padding: 12, borderRadius: 10, marginTop: 15, alignItems: 'center' }
});