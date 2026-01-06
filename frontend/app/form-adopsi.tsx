import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, SafeAreaView,
  KeyboardAvoidingView, Platform, Modal, FlatList
} from 'react-native';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
//import { StackNavigationProp } from '@react-navigation/stack';
import api, { BASE_URL, kucingAPI } from '../services/api';
import { useRouter } from 'expo-router';

// --- DEFINISI TIPE ---
type RootStackParamList = {
  AdoptKucing: undefined;
  FormAdopsi: { cat: any };
};

interface Wilayah {
  id: string;
  nama_provinsi?: string;
  nama_kabupaten_kota?: string;
  nama_kecamatan?: string;
}

const FormAdopsi = () => {
  //const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FormAdopsi'>>();

  // --- STATE FORM DATA ---
  const [email, setEmail] = useState(''); 
  const [namaLengkap, setNamaLengkap] = useState('');
  const [umur, setUmur] = useState('');
  const [nohp, setNohp] = useState('');
  const [pekerjaan, setPekerjaan] = useState('');
  const [alamat, setAlamat] = useState('');
  const [pernahPelihara, setPernahPelihara] = useState<'Ya' | 'Tidak' | ''>('');
  const [alasan, setAlasan] = useState('');
  const [komitmen, setKomitmen] = useState(false);

  // --- STATE DATA WILAYAH ---
  const [provinsi, setProvinsi] = useState<Wilayah[]>([]);
  const [kabupaten, setKabupaten] = useState<Wilayah[]>([]);
  const [kecamatan, setKecamatan] = useState<Wilayah[]>([]);

  // Ini adalah variabel yang menyimpan objek wilayah yang dipilih
  const [selProv, setSelProv] = useState<Wilayah | null>(null);
  const [selKab, setSelKab] = useState<Wilayah | null>(null);
  const [selKec, setSelKec] = useState<Wilayah | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<Wilayah[]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [currentType, setCurrentType] = useState<"prov" | "kab" | "kec">("prov");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => { loadProvinsi(); }, []);

  // --- FUNGSI LOAD DATA WILAYAH ---
  const loadProvinsi = async () => {
    try {
      const res = await api.get('/api/wilayah/provinsi');
      setProvinsi(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err: any) { console.error("Error load provinsi:", err.message); }
  };

  const loadKabupaten = async (provId: string) => {
    try {
      const res = await api.get(`/api/wilayah/kota/${provId}`);
      setKabupaten(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) { console.error(err); }
  };

  const loadKecamatan = async (kabId: string) => {
    try {
      const res = await api.get(`/api/wilayah/kecamatan/${kabId}`);
      setKecamatan(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) { console.error(err); }
  };

  // --- MODAL DROPDOWN HANDLER ---
  const openDropdown = (title: string, data: Wilayah[], type: "prov" | "kab" | "kec") => {
    if (data.length === 0 && type !== "prov") {
      return Alert.alert("Perhatian", "Silahkan pilih wilayah tingkat atasnya dulu.");
    }
    setModalTitle(title);
    setModalData(data);
    setCurrentType(type);
    setModalVisible(true);
  };

  const handleSelect = (item: Wilayah) => {
    if (currentType === "prov") {
      setSelProv(item); setSelKab(null); setSelKec(null); loadKabupaten(item.id);
    } else if (currentType === "kab") {
      setSelKab(item); setSelKec(null); loadKecamatan(item.id);
    } else {
      setSelKec(item);
    }
    setModalVisible(false);
  };

  // --- FUNGSI KIRIM DATA (SUBMIT) ---
  const handleSubmit = async () => {
    // Validasi dasar: Pastikan wilayah sudah dipilih karena Backend kamu MEWAJIBKAN ini
    if (!selProv || !selKab || !selKec) {
      return Alert.alert("Error", "Mohon lengkapi data Provinsi, Kota, dan Kecamatan.");
    }

    setIsSubmitting(true);
    try {
      // Ambil ID kucing dari route params jika ada, jika tidak pakai ID testing 114
      const catId = route.params?.cat?.id || 114;

      const payload = {
        // SESUAIKAN DENGAN CONTROLLER BACKEND (getValue(parts.xxx)):
        penggunaId: 1,           // Backend: parts.penggunaId
        kucingId: catId,         // Backend: parts.kucingId
        namaLengkap: namaLengkap, // Backend: parts.namaLengkap
        umur: parseInt(umur) || 0,
        alamat: alamat,          // Backend: parts.alamat
        nohp: nohp,              // Backend: parts.nohp
        pekerjaan: pekerjaan,    // Backend: parts.pekerjaan
        pernahPelihara: pernahPelihara === 'Ya' ? 1 : 0, // Backend: parts.pernahPelihara
        alasan: alasan,          // Backend: parts.alasan
        
        // WAJIB: Backend kamu cek '!metodeBayar' di baris 63
        metodeBayar: "Transfer", 

        // WILAYAH: Ambil ID dari state selProv, selKab, dan selKec
        provinsi_id: selProv.id, 
        kabupaten_kota_id: selKab.id,
        kecamatan_id: selKec.id,
      };

      console.log("Mengirim Payload Ke Backend:", JSON.stringify(payload, null, 2));

      const res = await api.post('/api/adopsi/submit', payload);
      
      if (res.data.success) {
        Alert.alert("Berhasil! 🎉", "Aplikasi adopsi Anda telah terkirim.");
        router.replace('/(tabs)/adopt'); // Gunakan replace agar tidak bisa back ke form lagi
      }

    } catch (err: any) {
      console.log("Detail Error Server:", err.response?.data);
      // Menampilkan pesan error spesifik dari backend jika ada
      const errorMsg = err.response?.data?.message || "Terjadi kesalahan pada server.";
      Alert.alert("Gagal Mengirim", errorMsg);
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
    
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Nama Lengkap *</Text>
            <TextInput style={styles.input} value={namaLengkap} onChangeText={setNamaLengkap}/>

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Umur</Text>
                <TextInput style={styles.input} value={umur} onChangeText={setUmur}/>
              </View>
              <View style={{ flex: 2 }}>
                <Text style={styles.label}>Pekerjaan</Text>
                <TextInput style={styles.input} value={pekerjaan} onChangeText={setPekerjaan}/>
              </View>
            </View>

            <Text style={styles.label}>No HP / WhatsApp *</Text>
            <TextInput style={styles.input} value={nohp} onChangeText={setNohp}  />

            <Text style={styles.label}>Provinsi</Text>
            <TouchableOpacity style={styles.dropdownBox} onPress={() => openDropdown("Pilih Provinsi", provinsi, "prov")}>
              <Text style={[styles.dropdownText, !selProv && {color: '#999'}]}>
                {selProv ? selProv.nama_provinsi : "Pilih Provinsi"}
              </Text>
              <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Kabupaten / Kota</Text>
            <TouchableOpacity 
              disabled={!selProv} 
              style={[styles.dropdownBox, !selProv && styles.disabledBox]} 
              onPress={() => openDropdown("Pilih Kota", kabupaten, "kab")}
            >
              <Text style={[styles.dropdownText, !selKab && {color: '#999'}]}>
                {selKab ? selKab.nama_kabupaten_kota : "Pilih Kota"}
              </Text>
              <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Kecamatan</Text>
            <TouchableOpacity 
              disabled={!selKab} 
              style={[styles.dropdownBox, !selKab && styles.disabledBox]} 
              onPress={() => openDropdown("Pilih Kecamatan", kecamatan, "kec")}
            >
              <Text style={[styles.dropdownText, !selKec && {color: '#999'}]}>
                {selKec ? selKec.nama_kecamatan : "Pilih Kecamatan"}
              </Text>
              <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Alamat Lengkap *</Text>
            <TextInput style={[styles.input, { height: 70 }]} multiline value={alamat} onChangeText={setAlamat} />

            <Text style={styles.label}>Pernah pelihara kucing?</Text>
            <View style={styles.radioGroup}>
              {['Ya', 'Tidak'].map((opt) => (
                <TouchableOpacity key={opt} style={styles.radioBtn} onPress={() => setPernahPelihara(opt as any)}>
                  <View style={[styles.radioCircle, pernahPelihara === opt && styles.radioSelected]} />
                  <Text>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Alasan ingin mengadopsi</Text>
            <TextInput style={[styles.input, { height: 80 }]} multiline value={alasan} onChangeText={setAlasan} placeholder="Ceritakan sedikit alasan Anda..." />
          </View>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setKomitmen(!komitmen)}>
            <View style={[styles.checkbox, komitmen && styles.checkboxActive]} />
            <Text style={styles.checkboxText}>Saya berkomitmen untuk merawat kucing ini dengan baik seumur hidupnya. *</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnSubmit, (!komitmen || isSubmitting) && {backgroundColor: '#ccc'}]} 
            onPress={handleSubmit} 
            disabled={!komitmen || isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Kirim Formulir Adopsi</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL UNTUK DROPDOWN WILAYAH */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>{modalTitle}</Text>
            <FlatList
              data={modalData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.itemRow} onPress={() => handleSelect(item)}>
                  <Text style={styles.itemText}>
                    {item.nama_provinsi || item.nama_kabupaten_kota || item.nama_kecamatan}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

export default FormAdopsi;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7c58f' },
  container: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  judul: { fontSize: 26, fontWeight: 'bold', color: '#7c4f3a' },
  deskripsi: { textAlign: 'center', color: '#d35400', marginTop: 5, fontWeight: 'bold' },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 20, elevation: 3 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 15, marginBottom: 8 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15 },
  row: { flexDirection: 'row' },
  dropdownBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14 },
  dropdownText: { fontSize: 15, color: '#333' },
  chevron: { fontSize: 12, color: '#888' },
  disabledBox: { backgroundColor: '#eee', opacity: 0.6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
  modalContent: { backgroundColor: 'white', borderRadius: 15, maxHeight: '70%', overflow: 'hidden' },
  modalHeader: { fontSize: 16, fontWeight: 'bold', padding: 15, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', color: '#7c4f3a' },
  itemRow: { padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#f1f1f1' },
  itemText: { fontSize: 15, color: '#333' },
  radioGroup: { flexDirection: 'row', gap: 30, marginTop: 10 },
  radioBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#f7961d' },
  radioSelected: { backgroundColor: '#f7961d' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 25, marginBottom: 30, gap: 10 },
  checkbox: { height: 20, width: 20, borderWidth: 2, borderColor: '#f7961d', borderRadius: 4 },
  checkboxActive: { backgroundColor: '#f7961d' },
  checkboxText: { flex: 1, fontSize: 13, color: '#333' },
  btnSubmit: { backgroundColor: '#f7961d', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 50 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});