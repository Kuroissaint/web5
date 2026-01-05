import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  
  // App Aturan Main
  borderRadius: {
    small: 8,
    medium: 12,
    large: 24,
    extraLarge: 30,
  },
  
  spacing: {
    cardPadding: 24,
    containerPadding: 25,
    inputGap: 18,
  },

  shadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  }
};