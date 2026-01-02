import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Button } from './Button';

interface InfoProps {
  title: string;
  text: string;
  image1: any;
  image2: any;
  btnText1: string;
  btnText2: string;
  onPress1: () => void;
  onPress2: () => void;
}

const InfoSection = ({ title, text, image1, image2, btnText1, btnText2, onPress1, onPress2 }: InfoProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      
      <View style={styles.imageContainer}>
        <Image source={image1} style={styles.image} />
        <Image source={image2} style={styles.image} />
      </View>

      <View style={styles.buttonGroup}>
        <Button title={btnText1} onPress={onPress1} style={styles.btn} />
        <Button title={btnText2} onPress={onPress2} style={[styles.btn, styles.btnSecondary]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', marginVertical: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#313957', marginBottom: 10 },
  text: { fontSize: 14, color: '#667085', lineHeight: 22, marginBottom: 20 },
  imageContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  image: { flex: 1, height: 150, borderRadius: 12 },
  buttonGroup: { gap: 10 },
  btn: { marginTop: 0 },
  btnSecondary: { backgroundColor: '#f6c590' } // Warna sekunder kamu
});

export default InfoSection;