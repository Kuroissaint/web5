import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export const Button = ({ title, loading, style, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, props.disabled || loading ? styles.disabled : {}, style]}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#9e7363', // Warna cokelat utama kamu
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});