import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface InputProps extends TextInputProps {
  label?: string;
}

export const Input = ({ label, secureTextEntry, ...props }: InputProps) => {
  // State untuk kontrol mata (buka/tutup)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholderTextColor={Colors.textMuted}
          // Logika: jika secureTextEntry true DAN mata tertutup, maka teks disembunyikan
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        
        {/* Hanya munculkan ikon mata jika ini adalah field password */}
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons 
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color={Colors.textMuted} 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Layout.spacing.inputGap, width: '100%' },
  label: { fontWeight: '600', color: Colors.primary, fontSize: 14, marginBottom: 8 },
  inputWrapper: {
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.inputBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  textInput: { flex: 1, fontSize: 16, color: Colors.black, height: '100%' },
  eyeIcon: { padding: 5 },
});