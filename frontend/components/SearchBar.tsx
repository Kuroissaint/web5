import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from "../constants/Colors";
import { Layout } from "../constants/Layout";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

const SearchBar = ({ value, onChangeText, onSubmit }: SearchBarProps) => (
  <View style={styles.searchBar}>
    <Ionicons name="search" size={20} color="#999" />
    <TextInput 
      placeholder="Cari ras atau nama..."
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit}
    />
  </View>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBg, // Pakai constant
        borderRadius: Layout.borderRadius.medium, // Pakai layout
        height: 42, 
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: Colors.black, // Pakai constant
        marginLeft: 8,
    },
    searchBar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#F1F3F5', 
        paddingHorizontal: 15, 
        borderRadius: 15, 
        height: 50 
    },
});

export default SearchBar;