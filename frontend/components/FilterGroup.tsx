import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

interface FilterGroupProps {
  listProvinsi: any[];
  listKota: any[];
  selectedProvinsi: any;
  onProvinsiChange: (prov: any) => void;
  selectedKota: string;
  onKotaChange: (kota: string) => void;
}

const FilterGroup = ({ 
  listProvinsi, listKota, selectedProvinsi, 
  onProvinsiChange, selectedKota, onKotaChange 
}: FilterGroupProps) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Tombol Laporan Anda - Mirip router-link di Vue */}
      <TouchableOpacity 
        style={styles.btnMySearch} 
        onPress={() => router.push('/my-search')}
      >
        <Text style={styles.btnText}>Laporan Anda</Text>
      </TouchableOpacity>

      <View style={styles.filterRow}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedProvinsi}
            onValueChange={(itemValue) => onProvinsiChange(itemValue)}
          >
            <Picker.Item label="Semua Provinsi" value={null} />
            {listProvinsi.map((prov) => (
              <Picker.Item key={prov.id} label={prov.nama_provinsi} value={prov} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedKota}
            onValueChange={(itemValue) => onKotaChange(itemValue)}
            enabled={!!selectedProvinsi} // Lock jika provinsi belum dipilih
          >
            <Picker.Item label="Semua Kota" value="" />
            {listKota.map((kota) => (
              <Picker.Item key={kota.id} label={kota.nama_kabupaten_kota} value={kota.nama_kabupaten_kota} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 15 },
  btnMySearch: { 
    backgroundColor: '#FEF0E6', 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 10, 
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#9e7363'
  },
  btnText: { color: '#9e7363', fontWeight: 'bold', fontSize: 12 },
  filterRow: { flexDirection: 'row', gap: 10 },
  pickerWrapper: { flex: 1, backgroundColor: '#F1F3F5', borderRadius: 12, height: 45, justifyContent: 'center' },
});

export default FilterGroup;