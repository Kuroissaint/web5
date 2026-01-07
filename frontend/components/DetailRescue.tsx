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

// KONFIGURASI URL
const BASE_URL = 'http://192.168.100.16:3000';
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
      // Ambil data (Gunakan filter manual agar lebih stabil seperti saran sebelumnya)
      const res = await axios.get(`${API_URL}/rescue`, { timeout: 8000 });
      const allData = res.data?.data || res.data || [];
      const data = allData.find((item: any) => String(item.id) === String(rescueId));

      if (data) {
        // --- LOGIKA PERBAIKAN GAMBAR ---
        let finalFoto = DEFAULT_FOTO;
        
        // Ambil field gambar (cek berbagai kemungkinan nama kolom di database kamu)
        const rawFoto = data.gambar || data.foto || data.url_gambar;

        if (rawFoto) {
          if (rawFoto.startsWith('http')) {
            // Jika sudah URL lengkap, pastikan localhost diganti IP agar bisa diakses HP
            finalFoto = rawFoto.replace('localhost', '192.168.100.16');
          } else {
            // Jika hanya nama file (misal: "123.jpg"), gabungkan dengan folder uploads
            // Pastikan slash (/) tidak double atau kurang
            const cleanPath = rawFoto.startsWith('/') ? rawFoto : `/uploads/${rawFoto}`;
            finalFoto = `${BASE_URL}${cleanPath}`;
          }
        }
        
        console.log("DEBUG URL GAMBAR:", finalFoto); // Cek di terminal apakah URL ini bisa dibuka di browser

        setLaporan({
          id: data.id,
          foto: finalFoto,
          namaPelapor: data.nama_pelapor || '-',
          telepon: data.telepon || '-',
          waktu: formatWaktu(data.waktu_penemuan || data.created_at),
          lokasi: data.lokasi_penemuan || '-',
          tag: data.nama_tag || data.tags || 'General',
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
          {/* Tombol X di Pojok */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#9E7363" />
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
                  <Text style={styles.value}>{laporan.deskripsi}</Text>
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

// Sub-komponen untuk baris info agar kode rapi
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 25,
    width: '90%',
    maxHeight: '85%',
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    top: 15,
    zIndex: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9E7363',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 10
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: '#eee'
  },
  infoContainer: { marginBottom: 15 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  descBox: { marginTop: 15 },
  label: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 2 },
  value: { fontSize: 15, color: '#333', fontWeight: '500' },
  statusSection: { marginTop: 15, alignItems: 'center' },
  statusBadge: {
    marginTop: 5,
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  selesai: { backgroundColor: '#2ecc71' },
  sedang: { backgroundColor: '#f1c40f' },
  belum: { backgroundColor: '#e74c3c' },
  btnBack: {
    backgroundColor: '#9E7363',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
  center: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#9E7363' },
  errorText: { color: '#e74c3c', marginBottom: 20 }
});

export default DetailRescue;