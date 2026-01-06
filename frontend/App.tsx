import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

// 1. Import library navigasi utama
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 2. Import MainTabNavigator (File ini berisi Bottom Tab: Home, Pesan, Profil)
import MainTabNavigator from './src/navigation/MainTabNavigator';

// 3. Import semua halaman (Screen) dari folder src/screen
import AdoptDetail from './src/screen/adoptDetail';
import FormAdopsi from './src/screen/FormAdopsi';
import FormAjuan from './src/screen/FormAjuan';
import AktivitasSaya from './src/screen/AktivitasSaya'; 

// Inisialisasi Stack Navigator
// Stack ini digunakan untuk halaman yang akan menutupi Bottom Tab Bar (seperti halaman Detail atau Form)
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        // "MainTabs" adalah halaman pertama yang muncul (Isinya Home, Pesan, Profil)
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: { backgroundColor: '#a56c54' }, // Warna coklat tema Meowment
          headerTintColor: '#fff', // Warna teks header putih
        }}
      >
        
        {/* HALAMAN UTAMA DENGAN BOTTOM TAB */}
        {/* headerShown: false karena kita akan menggunakan header dari masing-masing tab/screen */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator} 
          options={{ headerShown: false }} 
        />

        {/* HALAMAN DETAIL KUCING */}
        <Stack.Screen 
          name="AdoptDetail" 
          component={AdoptDetail} 
          options={{ title: 'Detail Kucing' }} 
        />

        {/* HALAMAN FORM UNTUK MENGAJUKAN ADOPSI (Tahap 1: Aplikasi) */}
        {/* Di sini data disimpan ke tabel aplikasi_adopsi */}
        <Stack.Screen 
          name="AjukanAdopsi" 
          component={FormAdopsi} 
          options={{ 
            title: 'Formulir Adopsi',
            headerStyle: { backgroundColor: '#f7c58f' },
            headerTintColor: '#7c4f3a',
          }} 
        />

        {/* HALAMAN FORM UNTUK MEMBUKA ADOPSI (Owner posting kucing) */}
        <Stack.Screen 
          name="AjukanKucing" 
          component={FormAjuan} 
          options={{ 
            title: 'Buka Adopsi Kucing',
            headerStyle: { backgroundColor: '#f7c58f' },
            headerTintColor: '#7c4f3a',
          }} 
        />

        {/* HALAMAN AKTIVITAS SAYA (Berisi 2 Tab: Adopsi Saya & Kucing Saya) */}
        {/* Halaman ini sangat penting untuk memisahkan proses seleksi dan transaksi */}
        <Stack.Screen 
          name="AktivitasSaya" 
          component={AktivitasSaya} 
          options={{ title: 'Riwayat Aktivitas' }} 
        />

      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});