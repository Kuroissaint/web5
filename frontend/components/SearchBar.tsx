import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from "../constants/Colors";
import { Layout } from "../constants/Layout";

// 1. Tambahkan placeholder dan buat onSubmit menjadi opsional
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void; // Opsional (?) agar tidak error jika tidak dipasang
  placeholder?: string; // Tambahkan properti placeholder di sini
}

const SearchBar = ({ value, onChangeText, onSubmit, placeholder }: SearchBarProps) => (
  <View style={styles.searchBar}>
    <Ionicons name="search" size={20} color="#999" />
    <TextInput 
      // 2. Gunakan properti placeholder yang di-passing, atau default jika kosong
      placeholder={placeholder || "Cari..."} 
      placeholderTextColor={Colors.textMuted}
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit} // Akan terpanggil saat menekan 'Enter' di keyboard
      returnKeyType="search"
    />
  </View>
);

const styles = StyleSheet.create({
    searchBar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#F1F3F5', 
        paddingHorizontal: 15, 
        borderRadius: 15, 
        height: 50,
        flex: 1, // Agar memenuhi ruang yang tersedia
        borderWidth: 1,
        borderColor: Colors.border,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: Colors.black,
        marginLeft: 10,
        height: '100%'
    },
});

export default SearchBar;