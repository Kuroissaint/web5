import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';

interface SocialProps {
  title: string;
  icon: ImageSourcePropType;
  onPress: () => void;
}

export const SocialButton = ({ title, icon, onPress }: SocialProps) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Image source={icon} style={styles.icon} />
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f3f9fa',
    marginBottom: 12,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  text: {
    fontSize: 14,
    color: '#313957',
  },
});