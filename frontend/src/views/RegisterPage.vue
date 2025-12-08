<template>
    <div :class="$style.loginPage">
      <div :class="$style.mainContainer">
        <div :class="$style.formBackgroundBox">
          
          <div :class="$style.leftSide">
            <div :class="$style.formBox">
              <div :class="$style.loginForm">
                <div :class="$style.intro">
                  <h1 :class="$style.welcomeTitle">
                    Selamat Datang 👋
                  </h1>
                  <p :class="$style.subtitle">Hari yang baru untuk teman berbulu kita</p>
                </div>
    
                <p v-if="successMessage" :class="$style.successMessage">
                    {{ successMessage }}
                </p>
                <p v-if="errorMessage" :class="$style.errorMessage">
                    {{ errorMessage }}
                </p>
  
                <form :class="$style.form" @submit.prevent="handleSignUp">
                  
                  <div :class="$style.inputGroup">
                    <label :class="$style.label">Nama Lengkap</label>
                    <input 
                      type="text" 
                      :class="$style.inputField"
                      v-model="fullName" 
                      placeholder="Contoh: Athar Ghaisan"
                      required
                      :disabled="loading"
                    />
                  </div>
    
                  <div :class="$style.inputGroup">
                    <label :class="$style.label">Email</label>
                    <input 
                      type="email" 
                      :class="$style.inputField"
                      v-model="email" 
                      placeholder="Contoh: example@email.com"
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
                      placeholder="Minimal 8 karakter"
                      required
                      :disabled="loading"
                    />
                  </div>

                  <div :class="$style.inputGroup">
                      <label :class="$style.label">Provinsi</label>
                      <select
                          :class="$style.inputField"
                          v-model="provinsiId"
                          required
                          :disabled="loading"
                      >
                          <option value="" disabled>Pilih Provinsi Anda</option>
                          <option v-for="p in provinces" :key="p.id" :value="p.id">
                            {{ p.nama_provinsi }} </option>
                      </select>
                  </div>
                  <button 
                    type="submit" 
                    :class="$style.loginButton"
                    :disabled="loading"
                  >
                    {{ loading ? 'Mendaftar...' : 'Daftar Sekarang' }}
                  </button>
                </form>
    
                <div :class="$style.divider">
                  <span>atau daftar dengan</span>
                </div>
    
                <div :class="$style.socialLogin">
                  <button :class="$style.socialButton" :disabled="loading">
                    <img src="../assets/Google.png" alt="Google" :class="$style.socialIcon" />
                    Google
                  </button>
                  <button :class="$style.socialButton" :disabled="loading">
                    <img src="../assets/Facebook.png" alt="Facebook" :class="$style.socialIcon" />
                    Facebook
                  </button>
                </div>
    
                <div :class="$style.signupLink">
                  Sudah punya akun? 
                  <router-link to="/login" :class="$style.signupText">
                      Masuk di sini.
                  </router-link>
                </div>
              </div>
            </div>
          </div>
    
          <div :class="$style.rightSide">
            <img 
              src="../assets/image.png" 
              alt="Kucing menggemaskan" 
              :class="$style.artImage"
            />
          </div>
        </div>
      </div>
    </div>
    </template>
    
    <script>
    import { authAPI, dataAPI } from '../services/api'; // Import dataAPI
    import { useRouter } from 'vue-router';
    import { ref, onMounted } from 'vue';
    
    export default {
      name: 'RegisterPage',
      setup() {
        const router = useRouter();
        const fullName = ref('');
        const email = ref('');
        const password = ref('');
        const provinsiId = ref('');
        const provinces = ref([]);
        const loading = ref(false);
        const errorMessage = ref(null);
        const successMessage = ref(null);

        // ✅ Ambil Provinsi dari Endpoint Wilayah
        const fetchProvinces = async () => {
            try {
                const response = await dataAPI.getProvinces();
                // Backend wilayah mengembalikan { success: true, data: [...] }
                provinces.value = response.data; 
            } catch (error) {
                console.error('Gagal load provinsi:', error);
            }
        };

        onMounted(fetchProvinces);

        const handleSignUp = async () => {
          loading.value = true;
          errorMessage.value = null;
          try {
            const userData = {
              fullName: fullName.value,
              email: email.value,
              password: password.value,
              provinsiId: provinsiId.value, 
            };
            
            await authAPI.register(userData);
            
            successMessage.value = 'Registrasi Berhasil! Mengalihkan...';
            setTimeout(() => router.push('/login'), 2000);

          } catch (error) {
            errorMessage.value = error.message || 'Gagal Mendaftar.';
          } finally {
            loading.value = false;
          }
        };

        return {
          fullName, email, password, provinsiId, provinces, 
          loading, errorMessage, successMessage, handleSignUp
        };
      },
    };
    </script>
    
    <style module>
    :root {
      --primary: #313957;
      --secondary: #f6c590; 
      --accent: #9e7363;
      --light-bg: #ffffff;
      --dark-text: #313957;
    }
    
    /* Global Container */
    .loginPage {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f7f9fc;
      padding: 20px;
    }
    
    .mainContainer {
      width: 100%;
      max-width: 1100px;
      padding: 20px;
    }
    
    /* Background Box untuk Form */
    .formBackgroundBox {
      display: flex;
      background-color: var(--light-bg);
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      min-height: 600px;
    }
    
    /* Left Side - Form */
    .leftSide {
      flex: 1;
      padding: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .formBox {
        width: 100%;
        max-width: 400px; 
    }

    .loginForm {
      width: 100%;
    }
    
    .intro {
      margin-bottom: 30px;
      text-align: center;
    }
    
    .welcomeTitle {
      color: var(--primary);
      margin-bottom: 5px;
      font-size: 2.2rem;
      font-weight: 700;
    }
    
    .subtitle {
      color: #667085;
      font-size: 1rem;
    }
    
    /* Form Styles */
    .form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .inputGroup {
      display: flex;
      flex-direction: column;
    }
    
    .label {
      font-size: 0.9rem;
      color: var(--dark-text);
      font-weight: 600;
      margin-bottom: 6px;
    }
    
    .inputField {
      padding: 12px 15px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      color: var(--dark-text);
      transition: border-color 0.3s;
    }
    
    .inputField:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(158, 115, 99, 0.2); 
    }

    .inputField:disabled {
        background-color: #f0f0f0;
        cursor: not-allowed;
    }
    
    .loginButton {
      padding: 14px;
      background-color: var(--accent);
      color: var(--light-bg);
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: background-color 0.3s, transform 0.1s;
      margin-top: 10px;
    }
    
    .loginButton:hover:not(:disabled) {
      background-color: #8c675a; 
    }

    .loginButton:disabled {
        background-color: #c0c0c0;
        cursor: not-allowed;
    }
    
    /* Divider */
    .divider {
      text-align: center;
      margin: 25px 0;
      font-size: 0.85rem;
      color: #999;
      position: relative;
    }
    
    .divider::before, .divider::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 40%;
      height: 1px;
      background-color: #e0e0e0;
    }
    
    .divider::before {
      left: 0;
    }
    
    .divider::after {
      right: 0;
    }
    
    /* Social Login */
    .socialLogin {
      display: flex;
      gap: 15px;
    }
    
    .socialButton {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #f3f9fa;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }
    
    .socialButton:hover:not(:disabled) {
      background-color: #e8f4f8;
      transform: translateY(-1px);
    }

    .socialButton:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }
    
    .socialIcon {
      width: 20px;
      height: 20px;
    }
    
    /* Sign Up Link */
    .signupLink {
      text-align: center;
      color: var(--dark-text);
      font-size: 1rem;
      margin-top: 20px;
    }
    
    .signupText {
      background: none;
      border: none;
      color: var(--accent); 
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
      background-color: var(--secondary); 
      border-radius: 0 12px 12px 0;
      overflow: hidden;
      
      @media (max-width: 768px) {
        display: none;
      }
    }
    
    .artImage {
      width: 100%;
      height: 100%;
      object-fit: cover;
      padding: 20px; 
    }
    
    /* --- Pesan Error dan Sukses --- */
    .errorMessage {
        color: #a94442; 
        background-color: #f2dede; 
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 15px;
        text-align: center;
        font-size: 0.9rem;
        border: 1px solid #ebccd1;
        font-weight: 500;
    }
    
    .successMessage {
        color: #3c763d; 
        background-color: #dff0d8; 
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 15px;
        text-align: center;
        font-size: 0.9rem;
        border: 1px solid #d6e9c6;
        font-weight: 500;
    }

    /* Responsiveness for smaller screens */
    @media (max-width: 1024px) {
        .formBackgroundBox {
            min-height: 500px;
        }
        .leftSide {
            padding: 30px;
        }
        .welcomeTitle {
            font-size: 2rem;
        }
    }

    @media (max-width: 768px) {
        .mainContainer {
            padding: 0;
        }
        .formBackgroundBox {
            box-shadow: none;
            border-radius: 0;
            min-height: 100vh; 
            flex-direction: column;
        }
        .leftSide {
            padding: 20px;
        }
        .formBox {
            max-width: none;
        }
    }
    </style>