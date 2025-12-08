<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo -->
      <div class="logo">
        <router-link :to="{ name: 'Home' }">Meowment</router-link>
      </div>

      <!-- Menu Items untuk Desktop -->
      <ul class="nav-menu">
        <li class="nav-item">
          <router-link 
            :to="{ name: 'Home' }" 
            class="nav-link"
            @click="closeMobileMenu"
          >
            Home
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            :to="{ name: 'Rescue' }" 
            class="nav-link"
            @click="closeMobileMenu"
          >
            Rescue
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            :to="{ name: 'Search' }" 
            class="nav-link"
            @click="closeMobileMenu"
          >
            Search
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            :to="{ name: 'Adopt' }" 
            class="nav-link"
            @click="closeMobileMenu"
          >
            Adopt
          </router-link>
        </li>
        <li class="nav-item">
          <router-link 
            :to="{ name: 'Donate' }" 
            class="nav-link"
            @click="closeMobileMenu"
          >
            Donate
          </router-link>
        </li>
      </ul>

      <!-- Auth Buttons untuk Desktop -->
      <div class="nav-auth desktop-auth">
        <template v-if="!isLoggedIn">
          <router-link 
            :to="{ name: 'Login' }" 
            class="auth-btn signin"
          >
            Login
          </router-link>
          <router-link 
            :to="{ name: 'Register' }" 
            class="auth-btn register"
          >
            Register
          </router-link>
        </template>
        <template v-else>
          <span class="user-welcome">Halo, {{ userName }}</span>
          <button @click="handleLogout" class="auth-btn logout">
            Logout
          </button>
        </template>
      </div>

      <!-- Hamburger Menu untuk Mobile -->
      <div class="hamburger" @click="toggleMobileMenu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div class="mobile-menu" :class="{ 'active': isMobileMenuOpen }">
      <div class="mobile-menu-content">
        <!-- Auth Buttons di Mobile -->
        <div class="mobile-auth">
          <template v-if="!isLoggedIn">
            <router-link 
              :to="{ name: 'Login' }" 
              class="auth-btn signin mobile-auth-btn"
              @click="closeMobileMenu"
            >
              Login
            </router-link>
            <router-link 
              :to="{ name: 'Register' }" 
              class="auth-btn register mobile-auth-btn"
              @click="closeMobileMenu"
            >
              Register
            </router-link>
          </template>
          <template v-else>
            <div class="mobile-user-info">
              <span class="user-welcome-mobile">Halo, {{ userName }}</span>
              <button @click="handleLogoutMobile" class="auth-btn logout mobile-auth-btn">
                Logout
              </button>
            </div>
          </template>
        </div>

        <!-- Menu Items untuk Mobile -->
        <ul class="mobile-nav-menu">
          <li class="mobile-nav-item">
            <router-link 
              :to="{ name: 'Home' }" 
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              🏠 Home
            </router-link>
          </li>
          <li class="mobile-nav-item">
            <router-link 
              :to="{ name: 'Rescue' }" 
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              🐾 Rescue
            </router-link>
          </li>
          <li class="mobile-nav-item">
            <router-link 
              :to="{ name: 'Search' }" 
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              🔍 Search
            </router-link>
          </li>
          <li class="mobile-nav-item">
            <router-link 
              :to="{ name: 'Adopt' }" 
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              ❤️ Adopt
            </router-link>
          </li>
          <li class="mobile-nav-item">
            <router-link 
              :to="{ name: 'Donate' }" 
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              💝 Donate
            </router-link>
          </li>
        </ul>
      </div>
    </div>

    <!-- Overlay untuk Mobile Menu -->
    <div 
      class="mobile-overlay" 
      :class="{ 'active': isMobileMenuOpen }" 
      @click="closeMobileMenu"
    ></div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { authAPI } from '../services/api'; // Import untuk logout

const isLoggedIn = ref(false);
const userName = ref('');
const isMobileMenuOpen = ref(false);
const router = useRouter();

// --- 1. LOGIC CEK LOGIN (DIPERBAIKI) ---
const checkLoginStatus = () => {
  // Ambil data dari LocalStorage (Sesuai yang disimpan di LoginPage)
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      // Parse string JSON menjadi Objek
      const user = JSON.parse(userStr);
      
      isLoggedIn.value = true;
      // Ambil username, kalau gak ada pakai email, kalau gak ada pakai 'User'
      userName.value = user.username || user.email || 'Teman Meowment'; 
    } catch (e) {
      console.error("Gagal parsing data user:", e);
      isLoggedIn.value = false;
    }
  } else {
    isLoggedIn.value = false;
    userName.value = '';
  }
};

// --- 2. LOGIC LOGOUT ---
const handleLogout = () => {
  // Panggil fungsi logout dari API service (biar bersih)
  authAPI.logout();
  
  // Reset State lokal
  isLoggedIn.value = false;
  userName.value = '';
  
  // Redirect ke halaman Login
  router.push({ name: 'Login' });
};

// Fungsi logout untuk mobile (sama, cuma tutup menu dulu)
const handleLogoutMobile = () => {
  closeMobileMenu();
  handleLogout();
};

// --- 3. UI LOGIC (Menu Mobile) ---
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : 'auto';
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = 'auto';
};

const handleResize = () => {
  if (window.innerWidth > 768) closeMobileMenu();
};

// --- LIFECYCLE ---
onMounted(() => {
  checkLoginStatus(); // Cek pas pertama load
  
  // Dengarkan event 'storage' (biar kalau login sukses, navbar langsung berubah tanpa refresh)
  window.addEventListener('storage', checkLoginStatus); 
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('storage', checkLoginStatus);
  window.removeEventListener('resize', handleResize);
  document.body.style.overflow = 'auto';
});
</script>

<style scoped>
.navbar {
  background-color: var(--darky);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

/* Logo */
.logo a {
  font-weight: 700;
  font-size: 1.8rem;
  color: var(--primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.logo a:hover {
  color: #ff9d45;
}

/* Desktop Menu */
.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  align-items: center;
  margin: 0;
  padding: 0;
}

.nav-link {
  color: var(--light);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--dark);
  background-color: var(--light);
  transform: translateY(-2px);
}

.nav-link.router-link-active {
  color: var(--dark);
  background-color: var(--light);
  font-weight: 600;
}

/* Desktop Auth Buttons */
.desktop-auth {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.auth-btn {
  padding: 0.7rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  min-width: 120px;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.auth-btn.signin {
  background-color: var(--light);
  color: var(--dark);
  border: 2px solid var(--light);
}

.auth-btn.register {
  background-color: var(--dark);
  color: var(--light);
  border: 2px solid var(--dark);
}

.auth-btn.signin:hover {
  background-color: var(--dark);
  color: var(--light);
  border: 2px solid var(--dark);
  transform: translateY(-2px);
}

.auth-btn.register:hover {
  background-color: var(--light);
  color: var(--dark);
  border: 2px solid var(--light);
  transform: translateY(-2px);
}

.auth-btn.logout {
  background-color: #ff6b6b;
  color: var(--light);
  border: 2px solid #ff6b6b;
}

.auth-btn.logout:hover {
  background-color: var(--light);
  color: #ff6b6b;
  border: 2px solid #ff6b6b;
  transform: translateY(-2px);
}

.user-welcome {
  color: var(--light);
  font-weight: 600;
  margin-right: 1rem;
  font-size: 0.9rem;
}

/* Hamburger Menu */
.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1001;
}

.bar {
  width: 25px;
  height: 3px;
  background-color: var(--light);
  margin: 3px 0;
  transition: 0.3s;
  border-radius: 2px;
}

/* Mobile Menu */
.mobile-menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 300px;
  height: 100vh;
  background-color: var(--darky);
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease-in-out;
  z-index: 999;
  overflow-y: auto;
}

.mobile-menu.active {
  right: 0;
}

.mobile-menu-content {
  padding: 5rem 1.5rem 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Mobile Auth */
.mobile-auth {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-auth-btn {
  width: 100%;
  margin-bottom: 0.8rem;
  justify-content: center;
}

.mobile-user-info {
  text-align: center;
}

.user-welcome-mobile {
  color: var(--light);
  font-weight: 600;
  display: block;
  margin-bottom: 1rem;
  font-size: 1rem;
}

/* Mobile Navigation Menu */
.mobile-nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-nav-item {
  margin-bottom: 0.5rem;
}

.mobile-nav-link {
  display: block;
  color: var(--light);
  text-decoration: none;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 1.1rem;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background-color: var(--light);
  color: var(--dark);
  transform: translateX(5px);
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 998;
}

.mobile-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* RESPONSIVE DESIGN */
@media (max-width: 1024px) {
  .nav-container {
    padding: 1rem 1.5rem;
  }
  
  .nav-menu {
    gap: 1.5rem;
  }
  
  .auth-btn {
    min-width: 100px;
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 1rem;
  }
  
  /* Sembunyikan desktop menu dan auth */
  .nav-menu,
  .desktop-auth {
    display: none;
  }
  
  /* Tampilkan hamburger */
  .hamburger {
    display: flex;
  }
  
  /* Animasi hamburger saat active */
  .hamburger.active .bar:nth-child(1) {
    transform: rotate(-45deg) translate(-5px, 6px);
  }
  
  .hamburger.active .bar:nth-child(2) {
    opacity: 0;
  }
  
  .hamburger.active .bar:nth-child(3) {
    transform: rotate(45deg) translate(-5px, -6px);
  }
  
  .mobile-menu.active ~ .hamburger .bar:nth-child(1) {
    transform: rotate(-45deg) translate(-5px, 6px);
  }
  
  .mobile-menu.active ~ .hamburger .bar:nth-child(2) {
    opacity: 0;
  }
  
  .mobile-menu.active ~ .hamburger .bar:nth-child(3) {
    transform: rotate(45deg) translate(-5px, -6px);
  }
  
  /* Logo size adjustment */
  .logo a {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0.8rem;
  }
  
  .mobile-menu {
    width: 280px;
  }
  
  .mobile-menu-content {
    padding: 4rem 1rem 2rem;
  }
  
  .logo a {
    font-size: 1.4rem;
  }
  
  .mobile-nav-link {
    padding: 0.8rem 1rem;
    font-size: 1rem;
  }
  
  .bar {
    width: 22px;
    height: 2.5px;
  }
}

/* Smooth transitions */
* {
  transition: color 0.3s ease, background-color 0.3s ease, transform 0.3s ease;
}

/* Prevent horizontal scroll */
body.menu-open {
  overflow: hidden;
}
</style>