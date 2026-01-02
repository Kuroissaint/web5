import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FooterSection = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>© 2026 Meowment. All Rights Reserved.</Text>
      <Text style={styles.subText}>Dibuat dengan ❤️ untuk Teman Berbulu</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    padding: 20,
    backgroundColor: '#313957',
    alignItems: 'center',
  },
  text: { color: '#fff', fontSize: 12 },
  subText: { color: '#ccc', fontSize: 10, marginTop: 5 }
});

export default FooterSection;