import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const OrDivider = () => (
  <View style={styles.container}>
    <View style={styles.line} />
    <Text style={styles.text}>Or</Text>
    <View style={styles.line} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#cfdfe2',
  },
  text: {
    marginHorizontal: 16,
    color: '#9e7363',
    fontSize: 14,
    fontWeight: '500',
  },
});