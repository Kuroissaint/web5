import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated'; // Tambahkan ini
import { Button } from './Button';

interface InfoProps {
  title: string;
  text: string;
  image1: any; // Replace 'any' with the appropriate type for your image source
  image2: any; // Replace 'any' with the appropriate type for your image source
  btnText1: string;
  btnText2: string;
  onPress1: () => void;
  onPress2: () => void;
}

const InfoSection = ({ title, text, image1, image2, btnText1, btnText2, onPress1, onPress2 }: InfoProps) => {
  return (
    <Animated.View 
      entering={FadeInDown.delay(200).duration(800)} // Animasi masuk tipis
      style={styles.container}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      
      <View style={styles.imageLayout}>
        {/* Foto 1: Besar dan Miring */}
        <Image source={image1} style={[styles.imageLarge, { transform: [{ rotate: '-2deg' }] }]} />
        {/* Foto 2: Kecil dan Menimpa Sedikit */}
        <Image source={image2} style={[styles.imageSmall, { transform: [{ rotate: '3deg' }] }]} />
      </View>

      <View style={styles.buttonRow}>
        <Button title={btnText1} onPress={onPress1} style={styles.btnPrimary} />
        <Button title={btnText2} onPress={onPress2} style={styles.btnSecondary} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 25, 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    marginHorizontal: 15, 
    marginVertical: 12, 
    elevation: 2 
  },
  title: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#313957', 
    marginBottom: 8 
  },
  text: { 
    fontSize: 14, 
    color: '#667085', 
    lineHeight: 20, 
    marginBottom: 25 
  },
  imageLayout: { 
    flexDirection: 'row', 
    height: 180, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 25 
  },
  imageLarge: { 
    width: '55%', 
    height: 160, 
    borderRadius: 25, 
    marginRight: -15 
  },
  imageSmall: { 
    width: '40%', 
    height: 130, 
    borderRadius: 25, 
    borderWidth: 3, 
    borderColor: '#fff' 
  },
  buttonRow: { 
    flexDirection: 'row',
     gap: 10 
    },
  btnPrimary: { 
    flex: 1.5, 
    marginTop: 0 
  }, // Ukuran lebih proporsional
  btnSecondary: { 
    flex: 1, 
    backgroundColor: '#FEF0E6', 
    marginTop: 0 
  },
});

export default InfoSection;