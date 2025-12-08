<template>
    <div :class="$style.loginPage">
      <div :class="$style.mainContainer">
        <div :class="$style.formBackgroundBox">
          <div :class="$style.leftSide">
            <div :class="$style.loginForm">
              <div :class="$style.intro">
                <h1 :class="$style.welcomeTitle">
                  Welcome 👋
                </h1>
                <p :class="$style.subtitle">Hari yang baru untuk teman berbulu kita</p>
              </div>
  
              <form :class="$style.form" @submit.prevent="handleSignIn">
                <div :class="$style.inputGroup">
                  <label :class="$style.label">Email</label>
                  <input 
                    type="email" 
                    :class="$style.inputField"
                    v-model="email" 
                    placeholder="Example@email.com"
                    required
                    :disabled="loading"
                  />
                </div>
                
                <div :class="$style.inputGroup">
                  <label :class="$style.label">Password</label>
                  <input 
                    type="password" 
                    :class="$style.inputField"
                    v-model="password" 
                    placeholder="At least 8 characters"
                    required
                    :disabled="loading"
                  />
                </div>
                
                <button type="button" :class="$style.forgotPassword">
                  Forgot Password?
                </button>
                
                <p v-if="errorMsg" style="color: red; font-size: 0.9rem; margin: 0;">{{ errorMsg }}</p>

                <button type="submit" :class="$style.mainButton" :disabled="loading">
                  {{ loading ? 'Signing in...' : 'Sign in' }}
                </button>
              </form>
  
              <div :class="$style.socialSignIn">
                <div :class="$style.orDivider">
                  <div :class="$style.dividerLine"></div>
                  <span :class="$style.orText">Or</span>
                  <div :class="$style.dividerLine"></div>
                </div>
                
                <div :class="$style.socialButtons">
                  <button :class="$style.socialButton">
                    <img :class="$style.socialIcon" alt="Google" src="../assets/Google.png" />
                    <span>Daftar dengan Google</span>
                  </button>
                  
                  <button :class="$style.socialButton">
                    <img :class="$style.socialIcon" alt="Facebook" src="../assets/Facebook.png" />
                    <span>Daftar dengan Facebook</span>
                  </button>
                </div>
              </div>
  
              <div :class="$style.signupLink">
                <span>Tidak punya akun? </span>
                <button :class="$style.signupText" @click="goToRegister">Daftar</button>
              </div>
            </div>
          </div>
        </div>
  
        <div :class="$style.rightSide">
          <img :class="$style.artImage" alt="Cat Art" src="../assets/image.png" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { authAPI } from '../services/api';
  
  const email = ref('');
  const password = ref('');
  const loading = ref(false);
  const errorMsg = ref('');
  const router = useRouter();
  
  const handleSignIn = async () => {
  errorMsg.value = '';
  if (!email.value || !password.value) {
    errorMsg.value = 'Harap isi email dan password.';
    return;
  }

  loading.value = true;

  try {
    // ✅ Panggil Login pakai API helper
    const response = await authAPI.login({
      email: email.value,
      password: password.value
    });

    // Simpan Token
    if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        router.push({ name: 'Home' }); // Masuk ke Home
    }

  } catch (err) {
    console.error('Login Gagal:', err);
    errorMsg.value = err.message || 'Login gagal.';
  } finally {
    loading.value = false;
  }
};
  
  const goToRegister = () => {
    router.push({ name: 'Register' }); // Pastikan nama route register Anda benar ('Register' atau 'SignUp')
  };
  </script>
  
  <style module>
  /* Style TETAP SAMA SEPERTI FILE ASLI ANDA */
  .loginPage {
    min-height: 100vh;
    background: url('../assets/background_fix.png') no-repeat center center fixed;
    background-size: cover;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .mainContainer {
    display: flex;
    max-width: 1000px;
    width: 100%;
    background: #f6c590;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    border: 1px solid #e0e0e0;
    position: relative;
  }
  
  /* Kotak Background untuk Form */
  .formBackgroundBox {
    flex: 1;
    background: rgba(255, 255, 240, 0.95);
    border-radius: 20px;
    margin: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.3);
    outline: 2px solid #000000;
    outline-offset: 0px;
  }
  
  /* Left Side - Form */
  .leftSide {
    flex: 1;
    padding: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .loginForm {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .intro {
    text-align: center;
  }
  
  .welcomeTitle {
    font-size: 2.5rem;
    font-weight: 700;
    color: #162d3a;
    margin: 0 0 8px 0;
    font-family: 'SF Pro Rounded', sans-serif;
  }
  
  .subtitle {
    font-size: 1.1rem;
    color: #313957;
    margin: 0;
    line-height: 1.5;
  }
  
  /* Form Styles */
  .form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .inputGroup {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .label {
    font-weight: 500;
    color: #9e7363;
    font-size: 0.9rem;
  }
  
  .inputField {
    padding: 14px 16px;
    border: 1px solid #d4d7e3;
    border-radius: 12px;
    background-color: #f7fbff;
    font-size: 1rem;
    transition: all 0.3s ease;
  }
  
  .inputField:focus {
    outline: none;
    border-color: #9e7363;
    box-shadow: #9e7363;
  }
  
  .forgotPassword {
    background: none;
    border: none;
    color: #9e7363;
    font-size: 0.9rem;
    cursor: pointer;
    text-align: left;
    padding: 0;
    align-self: flex-start;
  }
  
  .forgotPassword:hover {
    text-decoration: underline;
  }
  
  .mainButton {
    background-color: #9e7363;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .mainButton:hover {
    background-color: #f6c590;
  }

  /* Disabled state for button */
  .mainButton:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  /* Social Sign In */
  .socialSignIn {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .orDivider {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #9e7363;
  }
  
  .dividerLine {
    flex: 1;
    height: 1px;
    background-color: #cfdfe2;
  }
  
  .orText {
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .socialButtons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .socialButton {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    background-color: #f3f9fa;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }
  
  .socialButton:hover {
    background-color: #e8f4f8;
    transform: translateY(-1px);
  }
  
  .socialIcon {
    width: 20px;
    height: 20px;
  }
  
  /* Sign Up Link */
  .signupLink {
    text-align: center;
    color: #313957;
    font-size: 1rem;
  }
  
  .signupText {
    background: none;
    border: none;
    color: #9e7363;
    font-weight: 600;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .signupText:hover {
    text-decoration: underline;
  }
  
  /* Right Side - Image */
  .rightSide {
    flex: 1;
    display: flex;
  }
  
  .artImage {
    width: 100%;
    height: 100%;
    object-fit: cover;
    padding: 20px;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .mainContainer {
      flex-direction: column;
    }
    
    .formBackgroundBox {
      margin: 15px;
      border-radius: 15px;
      outline: 2px solid #000000;
    }
    
    .rightSide {
      display: none;
    }
    
    .leftSide {
      padding: 30px 20px;
    }
  }
  
  @media (max-width: 480px) {
    .formBackgroundBox {
      margin: 10px;
      border-radius: 12px;
      outline: 2px solid #000000;
    }
    
    .leftSide {
      padding: 20px 15px;
    }
  }
  </style>