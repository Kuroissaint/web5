<template>
  <section class="hero">
    <img :src="heroImage" alt="Hero Image" class="hero-image-full" />
    <div class="overlay"></div>

    <div class="content">
      <h1>Selamatkan, Adopsi, Sayangi</h1>
      <p>Bersama kita bisa membuat dunia lebih ramah bagi kucing.</p>
      
      <!-- Stats Section -->
      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-number">{{ stats.totalKucing || 0 }}</div>
          <div class="stat-label">Kucing Terselamatkan</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.totalDonasi || 0 }}</div>
          <div class="stat-label">Donasi Terkumpul</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.kucingDiadopsi || 0 }}</div>
          <div class="stat-label">Kucing Diadopsi</div>
        </div>
      </div>

      <button @click="handleGetStarted" :disabled="loading">
        {{ loading ? 'Loading...' : 'Mulai Sekarang' }}
      </button>
      
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { kucingAPI, donasiAPI } from '../services/api.js';

// Static asset import
import heroImage from '../assets/hero6.jpg';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const stats = ref({
  totalKucing: 0,
  totalDonasi: 0,
  kucingDiadopsi: 0
});

// Fetch stats data dari backend
const fetchStats = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Fetch kucing data
    const kucingResponse = await kucingAPI.getAll();
    const semuaKucing = kucingResponse.data || [];
    
    // Fetch donation stats
    const donasiResponse = await donasiAPI.getStats();
    const donasiData = donasiResponse.data || {};
    
    // Calculate stats
    stats.value = {
      totalKucing: semuaKucing.length,
      totalDonasi: donasiData.total?.total_donasi || 0,
      kucingDiadopsi: semuaKucing.filter(kucing => kucing.status === 'diadopsi').length
    };
    
  } catch (err) {
    console.error('Error fetching stats:', err);
    error.value = 'Gagal memuat data statistik';
    
    // Fallback stats kalau API error
    stats.value = {
      totalKucing: 127,
      totalDonasi: 45,
      kucingDiadopsi: 89
    };
  } finally {
    loading.value = false;
  }
};

// Handle button click
const handleGetStarted = () => {
  router.push('/donate'); // Arahkan ke halaman donasi
};

// Fetch data ketika component mounted
onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.hero {
  position: relative; 
  height: 90vh; 
  display: flex;
  align-items: center;
  padding: 0 6rem;
  color: beige;
  overflow: hidden;
  background-color: var(--browny); 
}

.hero-image-full {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; 
  z-index: 1;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.content {
  z-index: 3;
  max-width: 500px;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

/* Stats Container */
.stats-container {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

button {
  background-color: var(--primary);
  color: beige;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #8a6252;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero {
    padding: 0 2rem;
    height: 80vh;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .stats-container {
    gap: 1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
  }
}
</style>