import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screen dari folder src/screen kamu
import AdoptKucing from '../screen/adoptkucing'; // Ini file di gambar kamu
import ProfileScreen from '../screen/ProfileScreen'; // Kamu perlu buat ini
import MessageScreen from '../screen/MessageScreen'; // Pastikan path-nya benar

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF8C00',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={AdoptKucing} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="home" size={24} color={color} /> }}
      />
      <Tab.Screen 
        name="Pesan" 
        component={MessageScreen} // Buat untuk fitur chat sebelum form
        options={{ tabBarIcon: ({color}) => <Ionicons name="chatbubbles" size={24} color={color} /> }}
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen} 
        options={{ tabBarIcon: ({color}) => <Ionicons name="person" size={24} color={color} /> }}
      />
    </Tab.Navigator>
  );
}