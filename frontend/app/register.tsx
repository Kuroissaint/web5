import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

// Import Komponen & Constants
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { OrDivider } from '../components/OrDivider';
import { SocialButton } from '../components/SocialButton';
import { authAPI, dataAPI } from '../services/api';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

const RegisterScreen = () => {
  const router = useRouter();
  
  // --- States ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [provinsiId, setProvinsiId] = useState<string | number>('');
  const [provinces, setProvinces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Load Provinsi ---
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await dataAPI.getProvinces();
        // Backend membungkus data dalam { success: true, data: [...] }
        setProvinces(response.data.data || []); 
      } catch (error) {
        console.error('Gagal load provinsi:', error);
      }
    };
    fetchProvinces();
  }, []);

  // --- Handler Daftar ---
  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword || !provinsiId) {
      Alert.alert('Data Belum Lengkap', 'Harap isi semua bidang termasuk konfirmasi password.');
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert('Password Tidak Cocok', 'Pastikan kolom password dan konfirmasi password sama ya!');
      return;
    }

    setLoading(true);
    try {
      const userData = { username, email, password, provinsiId };
      await authAPI.register(userData);
      
      Alert.alert('Registrasi Berhasil! 🎉', 'Silakan masuk dengan akun baru kamu.', [
        { text: 'Masuk Sekarang', onPress: () => router.replace('/login') }
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal Mendaftar.';
      Alert.alert('Pendaftaran Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
        >
          {/* 1. KARTU GAMBAR (Identik dengan Login) */}
          <View style={styles.imageCardContainer}>
            <Image 
              style={styles.catImage} 
              resizeMode="cover" 
              source={require('../assets/catLogin.png')} 
            />
          </View>

          {/* 2. KARTU FORM REGISTER */}
          <View style={styles.cardContainer}>
            <View style={styles.header}>
              <Text style={styles.welcomeTitle}>Daftar Akun 👋</Text>
              <Text style={styles.subtitle}>Satu langkah lagi untuk membantu para anabul</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Nama Lengkap"
                placeholder="Contoh: Athar Ghaisan"
                value={username}
                onChangeText={setUsername}
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

              <Input
                  label="Konfirmasi Password"
                  placeholder="Ketik ulang password kamu"
                  secureTextEntry // Fitur mata juga aktif di sini
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

              {/* Dropdown Provinsi dengan Style Identik Input */}
              <View style={styles.pickerGroup}>
                <Text style={styles.label}>Provinsi</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={provinsiId}
                    onValueChange={(val) => setProvinsiId(val)}
                    enabled={!loading}
                    style={styles.picker}
                  >
                    <Picker.Item label="Pilih Provinsi Anda" value="" color={Colors.textMuted} />
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

            <View style={styles.socialGroup}>
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

            <View style={styles.loginLink}>
              <Text style={styles.loginNormalText}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginText}>Masuk di sini</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.secondary 
  },
  keyboardAvoid: { flex: 1 },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingHorizontal: Layout.spacing.containerPadding,
    paddingVertical: 30 
  },
  // --- STYLE KARTU GAMBAR (MATCH LOGIN) ---
  imageCardContainer: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.whiteTrans,
    borderRadius: Layout.borderRadius.large,
    overflow: 'hidden',
    marginBottom: 20, 
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Layout.shadow,
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  // --- STYLE KARTU FORM ---
  cardContainer: {
    width: '100%',
    backgroundColor: Colors.whiteTrans,
    borderRadius: Layout.borderRadius.large,
    paddingHorizontal: Layout.spacing.cardPadding,
    paddingVertical: 32,
    ...Layout.shadow,
  },
  header: { alignItems: 'center', marginBottom: 25 },
  welcomeTitle: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: Colors.black 
  },
  subtitle: { 
    fontSize: 14, 
    color: Colors.textSecondary, 
    textAlign: 'center', 
    opacity: 0.7 
  },
  form: { width: '100%' },
  pickerGroup: { marginBottom: Layout.spacing.inputGap },
  label: { 
    fontWeight: '600', 
    color: Colors.primary, 
    fontSize: 14, 
    marginBottom: 8 
  },
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.inputBg,
    justifyContent: 'center',
    height: 55,
    overflow: 'hidden',
  },
  picker: { width: '100%' },
  socialGroup: { 
    flexDirection: 'row', 
    gap: 15, 
    marginTop: 10,
    marginBottom: 10 
  },
  loginLink: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 25 
  },
  loginNormalText: { 
    color: Colors.textSecondary, 
    fontSize: 14 
  },
  loginText: { 
    color: Colors.primary, 
    fontWeight: 'bold', 
    fontSize: 14 
  },
});

export default RegisterScreen;