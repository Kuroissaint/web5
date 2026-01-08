import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Platform
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

interface DetailRescueProps {
  rescueId: number | string | null;
  visible: boolean;
  onClose: () => void;
}

interface Laporan {
  id: number | null;
  foto: string;
  namaPelapor: string;
  telepon: string;
  waktu: string;
  lokasi: string;
  tag: string;
  deskripsi: string;
  status: string;
}

// KONFIGURASI URL (Sesuaikan IP dengan IP Server kamu)
const BASE_URL = 'http://192.168.0.108:3000';
const API_URL = `${BASE_URL}/api`;
const DEFAULT_FOTO = 'https://via.placeholder.com/400x300.png?text=No+Image';

const DetailRescue: React.FC<DetailRescueProps> = ({
  rescueId,
  visible,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [statusClass, setStatusClass] = useState<'selesai' | 'sedang' | 'belum'>('belum');

  const [laporan, setLaporan] = useState<Laporan>({
    id: null,
    foto: DEFAULT_FOTO,
    namaPelapor: '-',
    telepon: '-',
    waktu: '-',
    lokasi: '-',
    tag: '-',
    deskripsi: '-',
    status: '-'
  });

  const formatWaktu = (waktu?: string) => {
    if (!waktu) return '-';
    try {
      return new Date(waktu).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return waktu;
    }
  };

  const updateStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('selesai')) return 'selesai';
    if (s.includes('proses') || s.includes('sedang')) return 'sedang';
    return 'belum';
  };

  const fetchDetail = async () => {
    if (!rescueId || !visible) return;

    setLoading(true);
    try {
      // Mengambil data rescue dari API
      const res = await axios.get(`${API_URL}/rescue`, { timeout: 8000 });
      const allData = res.data?.data || res.data || [];
      const data = allData.find((item: any) => String(item.id) === String(rescueId));

      if (data) {
        // Logika Penanganan Gambar
        let finalFoto = DEFAULT_FOTO;
        const rawFoto = data.gambar || data.url_gambar_utama;

        if (rawFoto) {
          if (rawFoto.startsWith('http')) {
            finalFoto = rawFoto.replace('localhost', '192.168.0.108');
          } else {
            finalFoto = `${BASE_URL}${rawFoto.startsWith('/') ? rawFoto : `/uploads/${rawFoto}`}`;
          }
        }

        setLaporan({
          id: data.id,
          foto: finalFoto,
          namaPelapor: data.nama_pelapor || '-',
          telepon: data.telepon || '-',
          waktu: formatWaktu(data.waktu_penemuan || data.created_at),
          lokasi: data.lokasi_penemuan || '-',
          tag: data.tags || data.nama_tag || 'General',
          deskripsi: data.deskripsi || '-',
          status: data.status_display || data.status || 'Pending'
        });

        setStatusClass(updateStatusClass(data.status_display || data.status || ''));
      }
    } catch (err) {
      console.error('Gagal ambil detail rescue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && rescueId) {
      fetchDetail();
    }
  }, [rescueId, visible]);

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Tombol Tutup */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#FF8C00" />
              <Text style={styles.loadingText}>Memuat detail...</Text>
            </View>
          ) : laporan.id ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>Detail Laporan #{laporan.id}</Text>

              <Image 
                source={{ uri: laporan.foto }} 
                style={styles.image} 
                resizeMode="cover"
              />

              <View style={styles.infoContainer}>
                <InfoItem label="Nama Pelapor" value={laporan.namaPelapor} />
                <InfoItem label="No. Telepon" value={laporan.telepon} />
                <InfoItem label="Waktu Penemuan" value={laporan.waktu} />
                <InfoItem label="Lokasi" value={laporan.lokasi} />
                <InfoItem label="Kondisi/Tag" value={laporan.tag} />
                
                <View style={styles.descBox}>
                  <Text style={styles.label}>Deskripsi Kejadian</Text>
                  <Text style={styles.valueText}>{laporan.deskripsi}</Text>
                </View>

                <View style={styles.statusSection}>
                  <Text style={styles.label}>Status Penanganan</Text>
                  <View style={[styles.statusBadge, styles[statusClass]]}>
                    <Text style={styles.statusText}>{laporan.status.toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.btnBack} onPress={onClose}>
                <Text style={styles.btnText}>Tutup</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.center}>
              <Text style={styles.errorText}>Data tidak ditemukan</Text>
              <TouchableOpacity style={styles.btnBack} onPress={onClose}>
                <Text style={styles.btnText}>Kembali</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Sub-komponen Baris Info
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.labelItem}>{label}</Text>
    <Text style={styles.valueItem}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 25, width: '90%', maxHeight: '85%', padding: 20, elevation: 10 },
  closeBtn: { position: 'absolute', right: 20, top: 15, zIndex: 10, backgroundColor: '#FFF3E0', borderRadius: 20, width: 35, height: 35, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FF8C00', textAlign: 'center', marginBottom: 15, marginTop: 10 },
  image: { width: '100%', height: 200, borderRadius: 15, marginBottom: 15, backgroundColor: '#eee' },
  infoContainer: { marginBottom: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  descBox: { marginTop: 15, backgroundColor: '#FFF9F0', padding: 10, borderRadius: 10 },
  label: { fontSize: 13, fontWeight: '600', color: '#FF8C00', marginBottom: 2 },
  labelItem: { fontSize: 13, fontWeight: '600', color: '#888' },
  valueText: { fontSize: 14, color: '#444', fontStyle: 'italic' },
  valueItem: { fontSize: 14, color: '#333', fontWeight: '500' },
  statusSection: { marginTop: 15, alignItems: 'center' },
  statusBadge: { marginTop: 5, paddingVertical: 6, paddingHorizontal: 20, borderRadius: 15 },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  selesai: { backgroundColor: '#2ecc71' },
  sedang: { backgroundColor: '#f1c40f' },
  belum: { backgroundColor: '#e74c3c' },
  btnBack: { backgroundColor: '#FF8C00', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  center: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#FF8C00' },
  errorText: { color: '#e74c3c', marginBottom: 20 }
});

export default DetailRescue;