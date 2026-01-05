import React, { useState } from "react";
import { 
  StyleSheet, 
  View, 
  Image, 
  Text, 
  TextInput, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { authAPI } from "../services/api";
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORT CONSTANTS BARU KAMU
import { Colors } from "../constants/Colors";
import { Layout } from "../constants/Layout";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        await AsyncStorage.setItem('token', response.data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
        router.replace('/(tabs)'); 
      }
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          
          {/* 1. KARTU GAMBAR */}
          <View style={styles.imageCardContainer}>
            <Image 
              style={styles.catImage} 
              resizeMode="cover" 
              source={require('../assets/catLogin.png')} 
            />
          </View>
          
          {/* 2. KARTU LOGIN */}
          <View style={styles.cardContainer}>
            <View style={styles.header}>
              <Text style={styles.welcomeTitle}>Selamat Datang 👋</Text>
              <Text style={styles.welcomeSubtitle}>Hari ini adalah hari yang baru.</Text>
            </View>
            
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="contoh:@email.com"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kata Sandi</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="minimal 8 karakter"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>
              
              <TouchableOpacity style={styles.forgotPasswordLink}>
                <Text style={styles.forgotPasswordText}>Lupa Kata Sandi?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.loginButtonText}>Masuk</Text>}
              </TouchableOpacity>
            </View>
            
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Atau</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Image style={styles.socialIcon} source={require('../assets/Google.png')} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image style={styles.socialIcon} source={require('../assets/Facebook.png')} />
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/register')}>
              <Text style={styles.registerText}>
                Belum punya akun? <Text style={styles.registerLinkText}>Daftar</Text>
              </Text>
            </TouchableOpacity>
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
    paddingHorizontal: Layout.spacing.containerPadding,
    paddingVertical: 30,
    justifyContent: 'center',
  },
  // --- STYLE KARTU GAMBAR ---
  imageCardContainer: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.whiteTrans,
    borderRadius: Layout.borderRadius.large,
    overflow: 'hidden',
    marginBottom: 20, 
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Layout.shadow, // Pakai shadow dari Layout
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  // --- STYLE KARTU LOGIN ---
  cardContainer: {
    width: '100%',
    backgroundColor: Colors.whiteTrans,
    borderRadius: Layout.borderRadius.large,
    paddingHorizontal: Layout.spacing.cardPadding,
    paddingVertical: 32,
    ...Layout.shadow,
  },
  header: { marginBottom: 30, alignItems: 'center' },
  welcomeTitle: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: Colors.black 
  },
  welcomeSubtitle: { 
    fontSize: 14, 
    color: Colors.textSecondary, 
    marginTop: 4 
  },
  form: { width: '100%' },
  inputGroup: { marginBottom: Layout.spacing.inputGap },
  inputLabel: { 
    fontSize: 14, 
    color: Colors.black, 
    marginBottom: 8, 
    fontWeight: '600' 
  },
  inputWrapper: {
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: 15,
    justifyContent: 'center'
  },
  textInput: { 
    fontSize: 16, 
    color: Colors.black, 
    height: '100%' 
  },
  forgotPasswordLink: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { 
    fontSize: 13, 
    color: Colors.link, 
    fontWeight: '700' 
  },
  loginButton: {
    backgroundColor: Colors.textPrimary, // Menggunakan warna gelap utama
    height: 52,
    borderRadius: Layout.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: { 
    fontSize: 16, 
    color: Colors.white, 
    fontWeight: "700" 
  },
  dividerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  dividerLine: { 
    flex: 1, 
    height: 1, 
    backgroundColor: Colors.divider 
  },
  dividerText: { 
    fontSize: 14, 
    color: Colors.textSecondary, 
    marginHorizontal: 15 
  },
  socialButtonsContainer: { 
    flexDirection: 'row', 
    gap: 15, 
    marginBottom: 20 
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.medium,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialIcon: { width: 20, height: 20 },
  socialButtonText: { 
    fontSize: 14, 
    color: Colors.textSecondary, 
    fontWeight: '600' 
  },
  registerLink: { alignItems: 'center' },
  registerText: { 
    fontSize: 14, 
    color: Colors.textSecondary 
  },
  registerLinkText: { 
    color: Colors.link, 
    fontWeight: "700" 
  },
});

export default LoginPage;