import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Library untuk Dropdown
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { OrDivider } from '../components/OrDivider';
import { SocialButton } from '../components/SocialButton';
import { authAPI, dataAPI } from '../services/api';

const RegisterScreen = ({ navigation }: any) => {
  // --- States ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [provinsiId, setProvinsiId] = useState<string | number>('');
  const [provinces, setProvinces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Side Effects: Load Provinsi ---
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await dataAPI.getProvinces();
        setProvinces(response.data.data); // Sesuaikan dengan struktur data backend Anda
      } catch (error) {
        console.error('Gagal load provinsi:', error);
      }
    };
    fetchProvinces();
  }, []);

  // --- Handler: Daftar ---
  const handleSignUp = async () => {
    if (!fullName || !email || !password || !provinsiId) {
      setErrorMsg('Harap isi semua bidang.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const userData = {
        fullName,
        email,
        password,
        provinsiId,
      };

      await authAPI.register(userData);
      
      Alert.alert('Sukses', 'Registrasi Berhasil! Silakan masuk.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Gagal Mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/background_fix.png')}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.intro}>
                <Text style={styles.welcomeTitle}>Selamat Datang 👋</Text>
                <Text style={styles.subtitle}>Hari yang baru untuk teman berbulu kita</Text>
              </View>

              {/* Form Pesan Error */}
              {errorMsg && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {/* Form Inputs */}
              <View style={styles.form}>
                <Input
                  label="Nama Lengkap"
                  placeholder="Contoh: Athar Ghaisan"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!loading}
                />

                <Input
                  label="Email"
                  placeholder="Contoh: example@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />

                <Input
                  label="Password"
                  placeholder="Minimal 8 karakter"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />

                {/* Dropdown Provinsi */}
                <View style={styles.pickerGroup}>
                  <Text style={styles.label}>Provinsi</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={provinsiId}
                      onValueChange={(itemValue) => setProvinsiId(itemValue)}
                      enabled={!loading}
                      style={styles.picker}
                    >
                      <Picker.Item label="Pilih Provinsi Anda" value="" color="#999" />
                      {provinces.map((p) => (
                        <Picker.Item key={p.id} label={p.nama_provinsi} value={p.id} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <Button
                  title="Daftar Sekarang"
                  onPress={handleSignUp}
                  loading={loading}
                />
              </View>

              <OrDivider />

              {/* Social Login */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <SocialButton 
                  title="Google" 
                  icon={require('../assets/Google.png')} 
                  onPress={() => {}} 
                />
                <SocialButton 
                  title="Facebook" 
                  icon={require('../assets/Facebook.png')} 
                  onPress={() => {}} 
                />
              </View>

              {/* Link Login */}
              <View style={styles.loginLink}>
                <Text style={styles.loginNormalText}>Sudah punya akun? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginText}>Masuk di sini.</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 240, 0.95)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginVertical: 40,
    elevation: 5,
  },
  intro: {
    alignItems: 'center',
    marginBottom: 25,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#313957',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#667085',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  // Picker Styling
  pickerGroup: {
    marginBottom: 15,
  },
  label: {
    fontWeight: '500',
    color: '#9e7363',
    fontSize: 14,
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#d4d7e3',
    borderRadius: 12,
    backgroundColor: '#f7fbff',
    overflow: 'hidden', // Penting untuk Android agar border radius bekerja
    justifyContent: 'center',
    height: 55, 
  paddingHorizontal: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  // Error Box
  errorBox: {
    backgroundColor: '#f2dede',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ebccd1',
    marginBottom: 15,
  },
  errorText: {
    color: '#a94442',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginNormalText: {
    color: '#313957',
    fontSize: 14,
  },
  loginText: {
    color: '#9e7363',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default RegisterScreen;

import { TouchableOpacity } from 'react-native';