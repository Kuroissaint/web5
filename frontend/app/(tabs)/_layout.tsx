import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Library ikon dari package.json kamu

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#FF8C00', // Warna saat menu diklik
      headerShown: false, // Sembunyikan header atas jika sudah ada Navbar
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rescue"
        options={{
          title: 'Rescue',
          tabBarIcon: ({ color }) => <Ionicons name="paw" size={28} color={color} />,
        }}
      />
      <Tabs.Screen 
        name="adopt" 
        options={{ title: 'Adopsi', 
        tabBarIcon: ({color}) => <Ionicons name="paw" size={24} color={color}/> }} />
      <Tabs.Screen 
        name="chats" 
        options={{ title: 'Pesan', 
        tabBarIcon: ({color}) => <Ionicons name="chatbubbles" size={24} color={color}/> }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="donate"
        options={{
          title: 'Donate',
          tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}