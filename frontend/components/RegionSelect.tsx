import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';

import { Colors } from "../constants/Colors";
import { Layout } from "../constants/Layout";

interface RegionData {
  provinsiId: number | null;
  kotaId: number | null;
  kecamatanId: number | null;
  lokasiFull: string;
}

interface RegionSelectProps {
  onRegionChange: (data: RegionData) => void;
}

const RegionSelect = ({ onRegionChange }: RegionSelectProps) => {
  const [listProvinsi, setListProvinsi] = useState<any[]>([]);
  const [listKota, setListKota] = useState<any[]>([]);
  const [listKecamatan, setListKecamatan] = useState<any[]>([]);

  const [selProv, setSelProv] = useState<any>(null);
  const [selKota, setSelKota] = useState<any>(null);
  const [selKec, setSelKec] = useState<any>(null);

  const [loading, setLoading] = useState({ prov: false, kota: false, kec: false });

  // 1. Ambil Provinsi (Mounted)
  useEffect(() => {
    setLoading(prev => ({ ...prev, prov: true }));
    api.get('/wilayah/provinsi')
      .then(res => setListProvinsi(res.data.data)) // FIX: Pakai .data.data
      .catch(err => console.error(err))
      .finally(() => setLoading(prev => ({ ...prev, prov: false })));
  }, []);

  // 2. Handler Ganti Provinsi -> Fetch Kota
  const handleProvChange = async (prov: any) => {
    setSelProv(prov);
    setSelKota(null);
    setSelKec(null);
    setListKota([]);
    setListKecamatan([]);

    if (prov) {
      setLoading(prev => ({ ...prev, kota: true }));
      try {
        const res = await api.get(`/wilayah/kota/${prov.id}`);
        setListKota(res.data.data); // FIX: Pakai .data.data
      } catch (err) { console.error(err); }
      finally { setLoading(prev => ({ ...prev, kota: false })); }
    }
  };

  // 3. Handler Ganti Kota -> Fetch Kecamatan
  const handleKotaChange = async (kota: any) => {
    setSelKota(kota);
    setSelKec(null);
    setListKecamatan([]);

    if (kota) {
      setLoading(prev => ({ ...prev, kec: true }));
      try {
        const res = await api.get(`/wilayah/kecamatan/${kota.id}`);
        setListKecamatan(res.data.data); // FIX: Pakai .data.data
      } catch (err) { console.error(err); }
      finally { setLoading(prev => ({ ...prev, kec: false })); }
    }
  };

  // 4. Kirim data ke Parent
  useEffect(() => {
    onRegionChange({
      provinsiId: selProv?.id || null,
      kotaId: selKota?.id || null,
      kecamatanId: selKec?.id || null,
      lokasiFull: `${selKec?.nama_kecamatan || ''}, ${selKota?.nama_kabupaten_kota || ''}, ${selProv?.nama_provinsi || ''}`
    });
  }, [selProv, selKota, selKec]);

  return (
    <View style={styles.container}>
      <View style={styles.pickerBox}>
        <Picker selectedValue={selProv} onValueChange={handleProvChange}>
          <Picker.Item label="-- Pilih Provinsi --" value={null} />
          {listProvinsi.map(p => (
            <Picker.Item key={p.id} label={p.nama_provinsi} value={p} />
          ))}
        </Picker>
      </View>

      <View style={[styles.pickerBox, !selProv && styles.disabled]}>
        {loading.kota ? <ActivityIndicator size="small" /> : (
          <Picker selectedValue={selKota} onValueChange={handleKotaChange} enabled={!!selProv}>
            <Picker.Item label="-- Pilih Kota/Kab --" value={null} />
            {listKota.map(k => (
              <Picker.Item key={k.id} label={k.nama_kabupaten_kota} value={k} />
            ))}
          </Picker>
        )}
      </View>

      <View style={[styles.pickerBox, !selKota && styles.disabled]}>
        {loading.kec ? <ActivityIndicator size="small" /> : (
          <Picker selectedValue={selKec} onValueChange={setSelKec} enabled={!!selKota}>
            <Picker.Item label="-- Pilih Kecamatan --" value={null} />
            {listKecamatan.map(kec => (
              <Picker.Item key={kec.id} label={kec.nama_kecamatan} value={kec} />
            ))}
          </Picker>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 10, marginVertical: 10 },
  pickerWrapper: {
    height: 40,
    borderWidth: 1.5,
    borderColor: Colors.border, // Pakai constant
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.inputBg,
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  label: {
    fontSize: 12, 
    fontWeight: '700',
    color: Colors.primary, // Pakai constant
    marginBottom: 4,
  },
  pickerBox: { 
    backgroundColor: '#F1F3F5', 
    borderRadius: 12, 
    height: 50, 
    justifyContent: 'center' 
},
  disabled: { 
    opacity: 0.5 
}
});

export default RegionSelect;