import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, Alert, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import Navbar from '../components/Navbar';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import RegionSelect from '../components/RegionSelect';
import { kucingAPI, dataAPI } from '../services/api'; 
import { Colors } from '../constants/Colors';
import { Picker } from '@react-native-picker/picker';

const SearchReportScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Form
  const [form, setForm] = useState({
    nama: '',
    nama_kucing: '',
    telepon: '',
    waktu: '',
    lokasi_detail: '',
    deskripsi: '',
    ras: '', // Tambahkan ini untuk Jenis Kucing
  });

  const [region, setRegion] = useState({
    provinsiId: null,
    kotaId: null,
    kecamatanId: null,
    lokasiFull: ''
  });

  const [groupedTags, setGroupedTags] = useState<{[key: string]: any[]}>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [jenisKucingList, setJenisKucingList] = useState<any[]>([]);

  // 1. AMBIL TAG DAN GROUPING BERDASARKAN KATEGORI
  useEffect(() => {
    const fetchJenis = async () => {
      try {
        const res = await kucingAPI.getJenis();
        if (res.data?.success) setJenisKucingList(res.data.data);
      } catch (err) {
        console.error("Gagal ambil jenis kucing", err);
      }
    };
    fetchJenis();

    const fetchTags = async () => {
      try {
        const response = await dataAPI.getAllTags(); //
        if (response.data?.data) {
          const grouped = response.data.data.reduce((acc: any, tag: any) => {
            if (!acc[tag.kategori]) acc[tag.kategori] = [];
            acc[tag.kategori].push(tag);
            return acc;
          }, {});
          setGroupedTags(grouped);
        }
      } catch (error) {
        console.error("Gagal ambil tag:", error);
      }
    };
    fetchTags();
  }, []);

  

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateText, setDateText] = useState("");
  const [timeText, setTimeText] = useState("");

  const showMode = (currentMode: 'date' | 'time') => {
    DateTimePickerAndroid.open({
      value: selectedDate,
      onChange: (event, date) => {
        if (event.type === 'set' && date) {
          const newDate = new Date(selectedDate);
          if (currentMode === 'date') {
            newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            setDateText(date.toLocaleDateString('id-ID'));
          } else {
            newDate.setHours(date.getHours(), date.getMinutes());
            setTimeText(date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
          }
          setSelectedDate(newDate);
          const formatted = newDate.toISOString().slice(0, 19).replace('T', ' ');
          setForm({ ...form, waktu: formatted });
        }
      },
      mode: currentMode,
      is24Hour: true,
    });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.7,
    });
    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      setImages([...images, ...newUris]);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // 2. SUBMIT LAPORAN
  const handleSubmit = async () => {
    if (!form.nama || !form.telepon || images.length === 0 || !region.provinsiId) {
      Alert.alert("Data Belum Lengkap", "Mohon isi Nama, No. Telp, Lokasi, dan minimal 1 Foto.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nama', form.nama);
      formData.append('nama_kucing', form.nama_kucing);
      formData.append('telepon', form.telepon);
      formData.append('waktu', form.waktu);
      formData.append('lokasi', form.lokasi_detail);
      formData.append('deskripsi', form.deskripsi);
      formData.append('ras', form.ras); // Pastikan ini dikirim ke backend
      formData.append('provinsi_id', String(region.provinsiId));
      formData.append('kabupaten_kota_id', String(region.kotaId));
      formData.append('kecamatan_id', String(region.kecamatanId));

      // Kirim Tag sebagai multiple entries
      selectedTags.forEach(tag => formData.append('tags', tag));

      images.forEach((uri) => {
        const filename = uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('foto', { uri, name: filename, type } as any);
      });

      const response = await kucingAPI.create(formData); //
      
      if (response.data.success) {
        Alert.alert("Laporan Terkirim!", "Semoga anabul segera ditemukan.", [
          { text: "Lihat Laporan Saya", onPress: () => router.push('/my-search') },
          { text: "Kembali", onPress: () => router.push('/(tabs)/search') }
        ]);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Gagal Mengirim", error.response?.data?.message || "Cek koneksi server kamu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.badge}><Text style={styles.badgeText}>Lost & Found</Text></View>
          <Text style={styles.title}>Buat Laporan Baru 🐾</Text>
          <Text style={styles.subtitle}>Berikan detail akurat agar anabul lebih mudah dikenali.</Text>
        </View>

        <View style={styles.formSection}>
          <Input label="Nama Pelapor" placeholder="Nama lengkap kamu" value={form.nama} onChangeText={(v) => setForm({...form, nama: v})} />
          <Input label="Nama Kucing" placeholder="Misal: Si Oyen" value={form.nama_kucing} onChangeText={(v) => setForm({...form, nama_kucing: v})} />
          <Input label="No. Telepon" placeholder="08xxxxxxxxxx" keyboardType="phone-pad" value={form.telepon} onChangeText={(v) => setForm({...form, telepon: v})} />
          
          {/* INPUT JENIS KUCING (RAS) */}
          <Text style={styles.label}>Jenis / Ras Kucing</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.ras}
              onValueChange={(itemValue) => setForm({ ...form, ras: itemValue })}
            >
              <Picker.Item label="Pilih Jenis Kucing" value="" color="#999" />
              {jenisKucingList.map((j) => (
                <Picker.Item key={j.id} label={j.nama_jenis} value={j.nama_jenis} />
              ))}
              <Picker.Item label="Lainnya / Tidak Tahu" value="Lainnya" />
            </Picker>
          </View>

          <Text style={styles.label}>Kapan Terakhir Terlihat?</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={[styles.inputTrigger, { flex: 1 }]} onPress={() => showMode('date')}>
              <Text style={{ color: dateText ? '#000' : '#999' }}>{dateText || "Pilih Tanggal"}</Text>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.inputTrigger, { flex: 1 }]} onPress={() => showMode('time')}>
              <Text style={{ color: timeText ? '#000' : '#999' }}>{timeText || "Pilih Jam"}</Text>
              <Ionicons name="time-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Wilayah Terakhir Terlihat</Text>
          <RegionSelect onRegionChange={setRegion} />
          
          <Input 
            label="Detail Lokasi"
            placeholder="Patokan lokasi atau alamat detail..." 
            multiline 
            numberOfLines={3} 
            value={form.lokasi_detail} 
            onChangeText={(v) => setForm({...form, lokasi_detail: v})} 
          />

          <Text style={styles.label}>Foto Kucing (Maks. 5)</Text>
          <View style={styles.imagesContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.btnRemoveImage} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={22} color="red" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <Ionicons name="camera-outline" size={30} color={Colors.primary} />
                <Text style={styles.pickerText}>Tambah</Text>
              </TouchableOpacity>
            )}
          </View>

          <Input 
            label="Ciri-ciri Khusus"
            placeholder="Misal: Kalung lonceng biru, ekor pendek..." 
            multiline 
            numberOfLines={4} 
            value={form.deskripsi} 
            onChangeText={(v) => setForm({...form, deskripsi: v})} 
          />

          {/* MENAMPILKAN TAG BERDASARKAN KATEGORI (MODULAR) */}
          <Text style={styles.labelSection}>Pilih Tag Deskripsi:</Text>
          {Object.entries(groupedTags).map(([kategori, tags]) => (
            <View key={kategori} style={styles.tagCategoryWrapper}>
              <Text style={styles.tagCategoryTitle}>{kategori}</Text>
              <View style={styles.tagRow}>
                {tags.map((tag: any) => (
                  <TouchableOpacity 
                    key={tag.id}
                    style={[styles.tagChip, selectedTags.includes(tag.nama_tag) && styles.tagSelected]}
                    onPress={() => toggleTag(tag.nama_tag)}
                  >
                    <Text style={[styles.tagText, selectedTags.includes(tag.nama_tag) && styles.tagTextSelected]}>
                      {tag.nama_tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

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
  badgeText: { color: Colors.primary, fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '800', color: '#313957', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#667085', lineHeight: 20 },
  formSection: { gap: 18 },
  label: { fontSize: 14, fontWeight: '700', color: '#313957', marginBottom: -5 },
  labelSection: { fontSize: 16, fontWeight: '800', color: '#313957', marginTop: 10 },
  
  // Tag Categories
  tagCategoryWrapper: { marginTop: 10 },
  tagCategoryTitle: { fontSize: 12, color: '#999', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: '#F1F3F5', borderWidth: 1, borderColor: '#eee' },
  tagSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tagText: { fontSize: 12, color: '#666' },
  tagTextSelected: { color: '#fff', fontWeight: 'bold' },

  inputTrigger: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F8F9FA', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#ddd',
  },
  pickerContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 5,
    overflow: 'hidden', 
  },
  imagesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  imageWrapper: { width: 80, height: 80, borderRadius: 10, position: 'relative' },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
  btnRemoveImage: { position: 'absolute', top: -10, right: -10, backgroundColor: 'white', borderRadius: 12 },
  imagePicker: { 
    width: 80, height: 80, backgroundColor: '#F8F9FA', borderRadius: 10, 
    borderStyle: 'dashed', borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center'
  },
  pickerText: { fontSize: 10, color: Colors.primary, fontWeight: 'bold' },
  
  buttonGroup: { flexDirection: 'row', gap: 15, marginTop: 30 },
  btnSubmit: { flex: 1.5, marginTop: 0 },
  btnCancel: { flex: 1, backgroundColor: '#EEEEEE', marginTop: 0 }
});

export default SearchReportScreen;