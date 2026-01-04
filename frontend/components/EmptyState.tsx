import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmptyState = () => (
  <View style={styles.emptyState}>
    <Ionicons name="paw-outline" size={80} color="#ddd" />
    <Text style={styles.emptyText}>Belum ada anabul yang ditemukan</Text>
    <Text style={styles.subText}>Coba ganti filter atau kata kunci kamu</Text>
  </View>
);

const styles = StyleSheet.create({
  emptyState: { alignItems: 'center', marginTop: 100, padding: 20 },
  emptyText: { color: '#666', fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  subText: { color: '#999', fontSize: 14, marginTop: 5 },
});

export default EmptyState;