import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import Screen Asli
import LoginScreen from './app/login';
import RegisterScreen from './app/register';
import HomeScreen from './app'; // Pastikan import yang ini!

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator id="mainStack" initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Daftar' }} />
        
        {/* Sekarang pakai HomeScreen yang asli, bukan dummy lagi */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}