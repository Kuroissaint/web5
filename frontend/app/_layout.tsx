import { Stack } from 'expo-router';
import { Colors } from '../constants/Colors'; // Pastikan path-nya benar

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> 
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      
      <Stack.Screen 
        name="searchReport" 
        options={{ 
          headerShown: true,           // Munculkan header agar ada tombol kembali
          headerTitle: "Buat Laporan",  // Judul di atas
          headerTintColor: '#9e7363',   // Warna tombol back & judul
        }} 
      />

      <Stack.Screen 
        name="my-search" 
        options={{ 
          headerShown: true, 
          headerTitle: "Laporan Saya" 
        }} 
      />
    </Stack>
  );
}