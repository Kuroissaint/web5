import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
  Alert,
  ImageBackground,
  Platform,
  FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAvoidingView, Keyboard } from 'react-native';

import axios from 'axios';

interface Tag {
  id: number;
  nama_tag: string; 
}

const API_URL = 'http://192.168.100.16:3000/api'; 

const FormRescue: React.FC<{ navigation: any }> = ({ navigation }) => {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [image, setImage] = useState<any>(null);

  // State untuk DateTimePicker
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

  /* ================= FETCH DATA TAG ================= */
  const fetchTags = async () => {
  try {
    const res = await axios.get(`${API_URL}/tags`);
    // Jika backend mengembalikan { success: true, data: [...] }
    const dataTags = res.data?.data || res.data; 
    setTags(Array.isArray(dataTags) ? dataTags : []);
  } catch (err) {
    console.error('Gagal ambil tag:', err);
  }
};

  useEffect(() => {
    fetchTags();
  }, []);

  /* ================= HANDLER DATETIME PICKER ================= */
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      setPickerMode('date');
      return;
    }

    if (selectedDate) {
      const currentDate = selectedDate;
      setDate(currentDate);

      if (pickerMode === 'date') {
        // Step 1: Simpan tanggal, lalu pindah ke mode Jam
        setPickerMode('time');
        if (Platform.OS === 'android') {
          setShowPicker(false);
          // Delay kecil agar dialog Android tidak tabrakan (anti-crash)
          setTimeout(() => setShowPicker(true), 100);
        }
      } else {
        // Step 2: Selesai pilih jam
        setShowPicker(false);
        setPickerMode('date');

        // Tampilan untuk User
        const formatted = currentDate.toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        setWaktuDisplay(formatted);

        // Simpan ke State Form (Format ISO untuk Database)
        setForm({ ...form, waktu: currentDate.toISOString() });
      }
    }
  };

  /* ================= PICK IMAGE ================= */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

/* ================= SUBMIT DATA (SUDAH DISAMAKAN DENGAN WEB) ================= */
const submitLaporan = async () => {
  if (!form.nama || !form.telepon || !form.tag_id || !form.lokasi) {
    Alert.alert("Peringatan", "Mohon isi semua data yang wajib!");
    return;
  }

  try {
    const formData = new FormData();
    formData.append('nama_pelapor', form.nama);
    formData.append('telepon', form.telepon);
    formData.append('lokasi_penemuan', form.lokasi);
    formData.append('deskripsi', form.deskripsi || "");
    formData.append('tag_id', String(form.tag_id));
    formData.append('waktu_penemuan', form.waktu);
    // formData.append('device_id', "mobile_device_meowment");
    // formData.append('kucing_id', '0');

    if (image) {
      const uri = image.uri;
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      // @ts-ignore
      formData.append('gambar', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type: type,
      });
    }

    // Gunakan axios secara langsung dengan timeout
    const res = await axios.post(
  `${API_URL}/rescue`,
  formData,
  {
    timeout: 20000,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }
);

    if (res.data?.success !== false) {
  setShowPopup(true);

  setTimeout(() => {
    setShowPopup(false);
    router.replace('/RescuePage' as any);
  }, 1500);
}


  } catch (err: any) {
    if (err.response) {
      // Masalah di Database/Backend (Error 500/400)
      console.log("SERVER ERROR:", err.response.data);
      Alert.alert('Gagal Simpan', err.response.data.message || 'Server error');
    } else {
      // Masalah Jaringan/Firewall
      console.log("LOG JARINGAN:", err.message);
      Alert.alert('Koneksi Gagal', 'Pastikan Server Backend Jalan & Firewall Laptop OFF');
    }
  }
};

  return (
    <ImageBackground source={require('../assets/images/background_fix.png')} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Buat Laporan Baru 🐾</Text>
          <Text style={styles.subtitle}>Bantu kucing yang membutuhkan bantuan segera.</Text>

          {/* Nama Pelapor */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nama Pelapor</Text>
            <TextInput style={styles.input} placeholder="Nama kamu" value={form.nama} onChangeText={(v) => setForm({ ...form, nama: v })} />
          </View>

          {/* No Telepon */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>No. Telepon</Text>
            <TextInput style={styles.input} placeholder="08xxxxxxxxxx" keyboardType="phone-pad" value={form.telepon} onChangeText={(v) => setForm({ ...form, telepon: v })} />
          </View>

          {/* Waktu Penemuan (DateTimePicker Trigger) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Waktu Penemuan</Text>
            <TouchableOpacity 
              style={styles.dropdownTrigger} 
              onPress={() => {
                setPickerMode('date');
                setShowPicker(true);
              }}
            >
              <Text style={waktuDisplay ? styles.dropdownText : styles.placeholderText}>
                {waktuDisplay || "Pilih Tanggal & Jam"}
              </Text>
              <Text style={styles.dropdownIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {/* Lokasi Penemuan */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Lokasi Penemuan</Text>
            <TextInput style={styles.input} placeholder="Contoh: Taman Kota Bandung" value={form.lokasi} onChangeText={(v) => setForm({ ...form, lokasi: v })} />
          </View>

          {/* Dropdown Tag */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Kategori (Tag)</Text>
            <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setShowTagModal(true)}>
              <Text style={form.tag_nama ? styles.dropdownText : styles.placeholderText}>
                {form.tag_nama || "Pilih kategori..."}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Deskripsi */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Deskripsi</Text>
            <TextInput style={[styles.input, styles.textarea]} placeholder="Kondisi kucing..." multiline value={form.deskripsi} onChangeText={(v) => setForm({ ...form, deskripsi: v })} />
          </View>

          {/* Upload Foto */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Upload Foto</Text>
            <TouchableOpacity style={styles.filePicker} onPress={pickImage}>
              <Text style={styles.filePickerText}>{image ? '✅ Foto Terpilih' : 'Pilih Gambar...'}</Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image.uri }} style={styles.previewImage} />}
          </View>

          {/* Tombol Aksi */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.btnCancel} onPress={() => router.back()}><Text style={styles.btnTextCancel}>Kembali</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnSubmit} onPress={submitLaporan}><Text style={styles.btnTextSubmit}>Kirim</Text></TouchableOpacity>
          </View>
        </View>

        {/* Modal Dropdown Tag */}
        <Modal visible={showTagModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Pilih Kategori</Text>
              <FlatList
                data={tags}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.tagOption} 
                    onPress={() => {
                      setForm({
                        ...form,
                        tag_id: String(item.id),
                        tag_nama: item.nama_tag
                      });
                      setShowTagModal(false);
                    }}

                  >
                    <Text style={styles.tagOptionText}>{item.nama_tag}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.btnCloseModal} onPress={() => setShowTagModal(false)}>
                <Text style={styles.btnCloseText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* DateTimePicker Component */}
        {showPicker && (
          <DateTimePicker
            value={date}
            mode={pickerMode}
            is24Hour={true}
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Modal Success */}
        <Modal transparent visible={showPopup} animationType="fade">
          <View style={styles.popupOverlay}>
            <View style={styles.popupBox}>
              <Text style={styles.popupEmoji}>🎉</Text>
              <Text style={styles.popupTitle}>Terkirim!</Text>
              <Text style={styles.popupDesc}>Laporan berhasil dibuat.</Text>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ImageBackground>
  );
};

export default FormRescue;

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 20, paddingVertical: 50 },
  formContainer: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 15, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#9E7363', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 20 },
  formGroup: { marginBottom: 15 },
  label: { fontWeight: '600', color: '#333', marginBottom: 5 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 15 },
  textarea: { height: 80, textAlignVertical: 'top' },
  dropdownTrigger: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: { color: '#333', fontSize: 15 },
  placeholderText: { color: '#aaa', fontSize: 15 },
  dropdownIcon: { color: '#9E7363', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '50%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#9E7363' },
  tagOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  tagOptionText: { fontSize: 16, color: '#333', textAlign: 'center' },
  btnCloseModal: { marginTop: 10, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10 },
  btnCloseText: { textAlign: 'center', color: '#888', fontWeight: 'bold' },
  filePicker: { backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed', borderRadius: 8, padding: 15, alignItems: 'center' },
  filePickerText: { color: '#888' },
  previewImage: { width: '100%', height: 180, borderRadius: 8, marginTop: 10 },
  buttonRow: { flexDirection: 'row', marginTop: 20, gap: 10 },
  btnSubmit: { flex: 1, backgroundColor: '#9E7363', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnTextSubmit: { color: '#fff', fontWeight: 'bold' },
  btnCancel: { flex: 1, backgroundColor: '#ddd', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnTextCancel: { color: '#333' },
  popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  popupBox: { width: '70%', backgroundColor: '#fff', padding: 25, borderRadius: 15, alignItems: 'center' },
  popupEmoji: { fontSize: 40 },
  popupTitle: { fontSize: 18, fontWeight: 'bold', color: '#9E7363' },
  popupDesc: { color: '#666', fontSize: 12, marginTop: 5 }
});