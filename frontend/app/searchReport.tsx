import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, Alert, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Komponen modular kita
import Navbar from '../components/Navbar';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import RegionSelect from '../components/RegionSelect';
import { kucingAPI } from '../services/api'; //

const SearchReportScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Form sesuai FormSearch.vue
  const [form, setForm] = useState({
    nama: '',
    nama_kucing: '',
    telepon: '',
    waktu: '',
    lokasi_detail: '',
    deskripsi: '',
  });

  const [region, setRegion] = useState({
    provinsiId: null,
    kotaId: null,
    kecamatanId: null,
    lokasiFull: ''
  });

  const [image, setImage] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Daftar tag (bisa kamu sesuaikan)
  const tagsList = ['Oyen', 'Putih', 'Hitam', 'Belang', 'Anggora', 'Persia', 'Kampung'];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (!form.nama || !form.telepon || !image || !region.provinsiId) {
      Alert.alert("Data Belum Lengkap", "Mohon isi Nama, No. Telp, Lokasi, dan Foto kucing.");
      return;
    }
  
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nama', form.nama);
      formData.append('nama_kucing', form.nama_kucing);
      formData.append('telepon', form.telepon);
      formData.append('waktu', form.waktu);
      formData.append('lokasi', form.lokasi_detail); // Samakan dengan backend 'lokasi'
      formData.append('deskripsi', form.deskripsi);
      formData.append('provinsi_id', String(region.provinsiId));
      formData.append('kabupaten_kota_id', String(region.kotaId)); // Sesuaikan ke kabupaten_kota_id
      formData.append('kecamatan_id', String(region.kecamatanId));
      
      // Kirim tags sebagai array (backend kamu sudah bisa handle array/string)
      selectedTags.forEach(tag => formData.append('tags', tag));
  
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('foto', { uri: image, name: filename, type } as any);
  
      await kucingAPI.create(formData); //
      
      Alert.alert("Laporan Terkirim!", "Semoga anabul segera ditemukan.", [
        { text: "Lihat Status", onPress: () => router.push('/my-search') },
        { text: "Ke Search", onPress: () => router.push('/(tabs)/search') }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Gagal Mengirim", "Pastikan semua field terisi dan server aktif.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.badge}><Text style={styles.badgeText}>Laporan Kucing Hilang</Text></View>
          <Text style={styles.title}>Buat Laporan Baru 🐾</Text>
          <Text style={styles.subtitle}>Bantu kami mengenali anabulmu agar cepat ditemukan.</Text>
        </View>

        <View style={styles.formSection}>
          <Input label="Nama Pelapor" placeholder="Nama lengkap kamu" value={form.nama} onChangeText={(v) => setForm({...form, nama: v})} />
          <Input label="Nama Kucing" placeholder="Misal: Si Belang" value={form.nama_kucing} onChangeText={(v) => setForm({...form, nama_kucing: v})} />
          <Input label="No. Telepon" placeholder="08xxxxxxxxxx" keyboardType="phone-pad" value={form.telepon} onChangeText={(v) => setForm({...form, telepon: v})} />
          <Input label="Waktu Terakhir Terlihat" placeholder="Kapan kucing menghilang?" value={form.waktu} onChangeText={(v) => setForm({...form, waktu: v})} />

          <Text style={styles.label}>Wilayah Terakhir Terlihat</Text>
          <RegionSelect onRegionChange={setRegion} />
          
          <Input 
            placeholder="Patokan lokasi atau alamat detail..." 
            multiline 
            numberOfLines={3} 
            value={form.lokasi_detail} 
            onChangeText={(v) => setForm({...form, lokasi_detail: v})} 
          />

          <Text style={styles.label}>Unggah Foto Kucing</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={styles.pickerPlaceholder}>
                <Ionicons name="cloud-upload-outline" size={40} color="#9e7363" />
                <Text style={styles.pickerText}>Ambil dari Galeri</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Ciri-ciri Fisik</Text>
          <Input 
            placeholder="Misal: Ekor bengkok, kalung merah..." 
            multiline 
            numberOfLines={4} 
            value={form.deskripsi} 
            onChangeText={(v) => setForm({...form, deskripsi: v})} 
          />

          <Text style={styles.label}>Kategori (Tags)</Text>
          <View style={styles.tagsContainer}>
            {tagsList.map(tag => (
              <TouchableOpacity 
                key={tag} 
                style={[styles.tagChip, selectedTags.includes(tag) && styles.tagActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonGroup}>
            <Button title="Batal" onPress={() => router.back()} style={styles.btnCancel} />
            <Button title="Kirim Laporan" loading={loading} onPress={handleSubmit} style={styles.btnSubmit} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 25, paddingBottom: 60 },
  header: { marginBottom: 30 },
  badge: { backgroundColor: '#FEF0E6', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 10 },
  badgeText: { color: '#9e7363', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '800', color: '#313957', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#667085', lineHeight: 20 },
  formSection: { gap: 18 },
  label: { fontSize: 14, fontWeight: '700', color: '#313957', marginBottom: -5 },
  imagePicker: { height: 220, backgroundColor: '#F8F9FA', borderRadius: 20, overflow: 'hidden', borderStyle: 'dashed', borderWidth: 2, borderColor: '#ddd', marginTop: 10 },
  previewImage: { width: '100%', height: '100%' },
  pickerPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pickerText: { color: '#9e7363', marginTop: 10, fontWeight: '600' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
  tagChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, backgroundColor: '#F1F3F5' },
  tagActive: { backgroundColor: '#9e7363' },
  tagText: { fontSize: 13, color: '#666' },
  tagTextActive: { color: '#fff', fontWeight: 'bold' },
  buttonGroup: { flexDirection: 'row', gap: 15, marginTop: 40 },
  btnSubmit: { flex: 1.8, marginTop: 0 },
  btnCancel: { flex: 1, backgroundColor: '#EEEEEE', marginTop: 0 }
});

export default SearchReportScreen;