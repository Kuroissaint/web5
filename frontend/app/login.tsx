import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ImageBackground, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { OrDivider } from '../components/OrDivider';
import { SocialButton } from '../components/SocialButton';
import { authAPI } from '../services/api';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      // ... logika simpan token ...
      navigation.replace('Home');
    } catch (err: any) {
      console.log('Detail Error:', err);
      // Ini akan memunculkan pesan error asli dari server atau axios
      Alert.alert('Login Gagal', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../assets/background_fix.png')} style={{flex:1}}>
      <SafeAreaView style={{flex:1}}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Welcome 👋</Text>
            <Text style={styles.subtitle}>Hari yang baru untuk teman berbulu kita</Text>

            <Input 
              label="Email" 
              placeholder="Example@email.com" 
              value={email} 
              onChangeText={setEmail} 
            />
            <Input 
              label="Password" 
              placeholder="At least 8 characters" 
              secureTextEntry 
              value={password} 
              onChangeText={setPassword} 
            />

            <Button title="Login" onPress={handleSignIn} loading={loading} />

            <OrDivider />

            <SocialButton 
              title="Daftar dengan Google" 
              icon={require('../assets/Google.png')} 
              onPress={() => {}} 
            />
            <SocialButton 
              title="Daftar dengan Facebook" 
              icon={require('../assets/Facebook.png')} 
              onPress={() => {}} 
            />
            <View style={styles.signupLink}>
              <Text style={styles.signupNormalText}>Tidak punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signupText}>Daftar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 20 },
  card: { 
    backgroundColor: 'rgba(255, 255, 240, 0.95)', 
    borderRadius: 20, 
    padding: 30 },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#162d3a', 
    textAlign: 'center' },
  subtitle: { 
    fontSize: 14, 
    color: '#313957', 
    textAlign: 'center', 
    marginBottom: 30 },
  signupLink: {
    flexDirection: 'row', // Biar teks "Tidak punya..." dan "Daftar" sejajar kesamping
    justifyContent: 'center',
    marginTop: 20,
  },
  signupNormalText: {
    color: '#313957',
    fontSize: 14,
  },
  signupText: {
    color: '#9e7363', // Warna cokelat tema kamu
    fontWeight: 'bold',
    fontSize: 14,
  },

});

export default LoginScreen;