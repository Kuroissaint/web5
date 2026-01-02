import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const Navbar = () => {
  return (
    <View style={styles.navbar}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.brandText}>Meowment</Text>
      
      {/* Ikon Menu atau Profile */}
      <TouchableOpacity onPress={() => console.log('Menu Pressed')}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    elevation: 4, // Shadow untuk Android
    shadowColor: '#000', // Shadow untuk iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    marginTop: 30, // Jarak dari status bar
  },
  logo: { width: 40, height: 40 },
  brandText: { fontSize: 20, fontWeight: 'bold', color: '#9e7363' },
  menuIcon: { fontSize: 24, color: '#313957' }
});

export default Navbar;