import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
}

export const Input = ({ label, ...props }: InputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#A0A0A0"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    fontWeight: '500',
    color: '#9e7363', // Warna cokelat label kamu
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d4d7e3',
    borderRadius: 12,
    backgroundColor: '#f7fbff',
    fontSize: 16,
    color: '#162d3a',
  },
});