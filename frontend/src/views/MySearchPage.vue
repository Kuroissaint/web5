<template>
  <div class="my-search-page-container">
    <div class="my-search-page-content">

      <div class="filter-bar">
        <div class="button-group-top">
          <router-link :to="{ name: 'Rescue' }" class="button inactive-link">
            <div class="laporan-anda">Cari Kucing Lain</div>
          </router-link>
        </div>
        <button class="button-action" @click="$router.push('/')">
          <div class="laporan-anda">Ke Beranda</div>
        </button>
      </div>

      <h1 class="page-title">Pantau status kucingmu yang hilang 🐾</h1>

      <div v-if="loading" class="state-container">
        <div class="loading-spinner"></div>
        <p>Memuat data laporanmu...</p>
      </div>

      <div v-else-if="myReports.length === 0" class="state-container">
        <img src="../assets/kucingOyen.png" alt="Kosong" style="width: 100px; opacity: 0.6;">
        <h3>Belum ada laporan.</h3>
        <p>Kamu belum pernah melaporkan kehilangan kucing di perangkat ini.</p>
        <router-link :to="{ name: 'Report' }" class="button-action" style="margin-top: 20px; text-decoration: none;">
          Buat Laporan
        </router-link>
      </div>

      <div v-else>
        <div 
          v-for="cat in myReports" 
          :key="cat.id" 
          class="report-detail-card"
        >
          
          <div class="report-content-left">
            
            <div class="detail-description">
              <div class="header-row">
                <h2 style="margin-bottom: 20px; color: var(--dark);">{{ cat.nama_kucing }}</h2>
              </div>

              <div class="info-item">
                <strong>Status</strong><span>:</span>
                <p style="text-transform: uppercase; font-weight: bold; color: #d35400;">{{ cat.status }}</p>
              </div>
              <div class="info-item">
                <strong>Ras/Jenis</strong><span>:</span>
                <p>{{ cat.jenis_kucing || cat.ras || '-' }}</p>
              </div>
              <div class="info-item">
                <strong>Deskripsi</strong><span>:</span>
                <p>{{ cat.deskripsi || '-' }}</p>
              </div>
              <div class="info-item">
                <strong>Lokasi Hilang</strong><span>:</span>
                <p>{{ cat.lokasi_display || '-' }}</p>
              </div>
              <div class="info-item">
                <strong>Waktu Hilang</strong><span>:</span>
                <p>{{ formatDate(cat.waktu_hilang) }}</p>
              </div>
              <div class="info-item">
                <strong>Ciri/Tag</strong><span>:</span>
                <p>{{ cat.tags || '-' }}</p>
              </div>
            </div>
            
            <div class="status-timeline">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: getProgressWidth(cat.status) }"></div>
              </div>
              <div class="status-steps">
                <div class="step" :class="{ active: getStepLevel(cat.status) >= 1 }">
                  <div class="step-dot"></div>
                  <span class="step-label">Dilaporkan</span>
                </div>
                <div class="step" :class="{ active: getStepLevel(cat.status) >= 2 }">
                  <div class="step-dot"></div>
                  <span class="step-label">Ditemukan</span>
                </div>
                <div class="step" :class="{ active: getStepLevel(cat.status) >= 3 }">
                  <div class="step-dot"></div>
                  <span class="step-label">Diproses</span>
                </div>
                <div class="step" :class="{ active: getStepLevel(cat.status) >= 4 }">
                  <div class="step-dot"></div>
                  <span class="step-label">Selesai</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="report-photos-right">
            
            <div class="carousel-wrapper">
              
              <button class="nav-btn prev" @click="scrollCarousel($event, -1)">&#10094;</button>

              <div class="photo-carousel" ref="carouselRef">
                <div 
                  v-for="(imgUrl, index) in getPhotoList(cat)" 
                  :key="index" 
                  class="carousel-item"
                >
                  <img :src="imgUrl" alt="Foto Kucing" />
                </div>

                <div v-if="getPhotoList(cat).length === 0" class="carousel-item">
                  <img src="/src/assets/kucheng.png" alt="No Image" />
                </div>
              </div>

              <button class="nav-btn next" @click="scrollCarousel($event, 1)">&#10095;</button>
              
            </div>

            <div class="swipe-hint" v-if="getPhotoList(cat).length > 1">
              <span>← Geser atau gunakan tombol →</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import API from '../services/api';

// State
const myReports = ref([]);
const loading = ref(true);

// --- 1. LOGIC FETCH DATA ---
onMounted(async () => {
  loading.value = true;
  
  const storedIds = JSON.parse(localStorage.getItem('my_reports') || '[]');

  if (storedIds.length === 0) {
    loading.value = false;
    return;
  }

  try {
    const response = await API.get('/kucing/search', {
      params: { ids: storedIds }
    });
    
    console.log("DATA DARI BACKEND:", response.data); // Debugging
    
    // ⚠️ PERBAIKAN UTAMA DI SINI ⚠️
    // Ambil array yang ada di dalam properti 'data'
    if (response.data && response.data.data) {
        myReports.value = response.data.data; 
    } else {
        // Fallback kalau backend langsung kirim array (jarang terjadi di setup kita)
        myReports.value = response.data;
    }

  } catch (e) {
    console.error("Gagal load data laporan:", e);
  } finally {
    loading.value = false;
  }
});

// --- 2. HELPER FOTO ---
// Fungsi untuk mengisi grid foto. 
// Jika user cuma upload 1 foto, kotak lainnya tetap terisi placeholder biar layout bagus.
// Helper memecah string foto dari backend
function getPhotoList(cat) {
  // Gunakan list_foto (yang banyak), kalau null pakai foto (yang satu)
  const raw = cat.list_foto || cat.foto;
  
  if (!raw) return []; // Kalau kosong banget
  
  // Pisahkan koma dan filter yang kosong
  return raw.split(',').filter(url => url.trim() !== '');
}

// Fungsi Scroll Manual dengan Tombol
const scrollCarousel = (event, direction) => {
  // Cari elemen carousel terdekat dari tombol yang diklik
  const wrapper = event.target.closest('.carousel-wrapper');
  const container = wrapper.querySelector('.photo-carousel');
  
  // Scroll sejauh lebar 1 gambar (sekitar 300px)
  const scrollAmount = 300; 
  container.scrollBy({ 
    left: direction * scrollAmount, 
    behavior: 'smooth' 
  });
}

// --- 3. HELPER TIMELINE ---
function getStepLevel(status) {
  // Mapping status teks ke Level Angka (1-4)
  const s = status ? status.toLowerCase() : '';
  if (s === 'selesai' || s === 'diadopsi') return 4;
  if (s === 'diproses' || s === 'menunggu_verifikasi') return 3;
  if (s === 'ditemukan') return 2;
  return 1; // Default 'hilang' atau 'dilaporkan'
}

function getProgressWidth(status) {
  const level = getStepLevel(status);
  const totalSteps = 4;
  // Rumus persentase width CSS
  return `${((level - 1) / (totalSteps - 1)) * 100}%`;
}

// --- 4. HELPER FORMAT DATE ---
function formatDate(dateString) {
  if(!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}
</script>

<style scoped>
.my-search-page-container {
  background-color: var(--browny); 
  padding: 32px 64px;
  min-height: 85vh;
  padding-bottom: 64px;
  color: var(--dark);
}

/* Loading / Empty State */
.state-container {
  text-align: center;
  padding: 50px;
  background: rgba(255,255,255,0.5);
  border-radius: 20px;
  margin-top: 20px;
}
.loading-spinner {
  border: 4px solid rgba(0,0,0,0.1); border-top: 4px solid var(--dark); 
  border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* --- Filter Bar --- */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.button-group-top {
  display: flex;
  gap: 16px;
  margin-left: 24px;
  padding-top: 20px;
}

.button {
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  min-width: 128px;
  text-decoration: none;
}

/* Style untuk link aktif/inaktif */
.active-link {
  background-color: var(--light); 
  border: 1px solid var(--dark);
  color: var(--dark);
}

.inactive-link {
  background-color: var(--dark);
  border: 1px solid var(--dark);
  color: var(--light); 
}

.button-action {
  border-radius: 8px;
  background-color: var(--dark);
  border: 1px solid var(--dark);
  padding: 12px 20px;
  color: var(--light);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.page-title {
  font-size: 30px;
  line-height: 100%;
  margin-left: 56px;
  margin-bottom: 30px;
  font-family: 'Poppins', sans-serif;
  color: var(--dark);
}

/* --- Kartu Detail Laporan --- */
.report-detail-card {
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 30px;
  background-color: #fffdf9; /* Sedikit off-white biar nyaman */
  border: 1px solid #d9d9d9;
  padding: 40px;
  display: flex;
  gap: 40px;
  margin: 0 32px 40px 32px; /* Margin bottom ditambah untuk kartu berikutnya */
  min-height: 550px;
}

.report-content-left {
  flex: 1; 
  max-width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* --- Deskripsi Kucing --- */
.detail-description {
  color: var(--dark);
}

.info-item {
  display: grid;
  grid-template-columns: 160px 10px 1fr;
  align-items: start;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 16px;
}

.info-item strong {
  color: #3c2a21;
  font-weight: 600;
}

.info-item span {
  font-weight: bold;
  color: #3c2a21;
}

.info-item p {
  margin: 0;
  color: #2c2c2c;
  line-height: 1.4;
}

/* --- Status Timeline --- */
.status-timeline {
  position: relative;
  margin-top: 40px;
  padding: 20px 0;
}

.progress-bar {
  position: absolute;
  top: 35px;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  z-index: 1;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, var(--primary), #f39c12);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.status-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #e0e0e0;
  border: 4px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 8px;
  z-index: 3;
  transition: all 0.3s ease;
}

.step.active .step-dot {
  background-color: var(--primary);
  box-shadow: 0 0 8px rgba(244, 139, 41, 0.5);
  transform: scale(1.1);
}

.step-label {
  font-size: 14px;
  font-weight: 500;
  color: #767676;
  text-align: center;
  line-height: 1.2;
}

.step.active .step-label {
  color: var(--dark);
  font-weight: 700;
}

/* --- Foto Kanan --- */
.report-photos-right {
  flex: 1;
  max-width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* overflow: hidden;  */
}

.photo-carousel {
  display: flex;
  gap: 15px;
  overflow-x: auto; /* ✅ Ini yang bikin bisa digeser */
  scroll-snap-type: x mandatory; /* Biar berhenti pas di tengah gambar */
  padding: 10px 5px;
  
  /* Sembunyikan Scrollbar (biar rapi) */
  scrollbar-width: none;  /* Firefox */
  -ms-overflow-style: none;  /* IE */
}
.photo-carousel::-webkit-scrollbar { 
  display: none; /* Chrome/Safari */
}

.carousel-item {
  flex: 0 0 100%; /* Kembali ke 100% biar full satu frame */
  height: 350px;
  border-radius: 16px; /* Radius sedikit dikurangi biar lebih tegas */
  overflow: hidden;
  scroll-snap-align: center;
  
  /* ✅ UBAH BACKGROUND JADI GELAP (Biar foto fokus) */
  background-color: #222; 
  border: 1px solid #444;
  
  /* Posisikan gambar di tengah */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  /* ✅ GANTI JADI CONTAIN (Agar seluruh badan kucing terlihat utuh, tidak terpotong) */
  object-fit: contain; 
}

.swipe-hint {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 10px;
  font-style: italic;
  animation: pulse 2s infinite;
}

.carousel-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* Tombol Navigasi */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  
  /* ✅ Tombol Putih Solid dengan Shadow Kuat */
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  
  border: none;
  width: 40px; /* Lebih besar */
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  z-index: 10;
  transition: all 0.2s ease;
  
  display: flex; justify-content: center; align-items: center;
}

.nav-btn:hover {
  background-color: white;
  transform: translateY(-50%) scale(1.1); /* Efek membesar pas di-hover */
}

/* Posisi Tombol */
.prev { left: 15px; }
.next { right: 15px; }

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* Responsif HP */
@media (max-width: 768px) {
  .report-photos-right { 
    max-width: 100%; 
    margin-top: 20px;
  }
  .carousel-item { 
    height: 250px; /* Di HP agak pendekan dikit */
  }
}

/* Responsif */
/* --- RESPONSIVE MOBILE --- */
@media (max-width: 768px) {
  .my-search-page-container {
    padding: 20px 16px; /* Padding layar lebih kecil */
  }

  .filter-bar {
    flex-direction: column-reverse; /* Tombol pindah ke atas */
    gap: 15px; align-items: stretch;
  }
  .button-action, .inactive-link { text-align: center; }
  .page-title { font-size: 1.5rem; text-align: center; margin-left: 0; }

  /* CARD: Layout Vertikal & Lebih Rapi */
  .report-detail-card {
    flex-direction: column;
    padding: 24px 20px; /* Padding dalam card pas */
    gap: 20px;
  }
  
  /* --- PERUBAHAN UTAMA DI SINI (Layout Teks) --- */
  /* Ubah dari Kiri-Kanan jadi Atas-Bawah */
  .info-item {
    display: flex; 
    flex-direction: column; /* Label di atas, Isi di bawah */
    gap: 4px;
    margin-bottom: 12px;
    border-bottom: 1px dashed #eee; /* Garis pemisah tipis biar rapi */
    padding-bottom: 8px;
  }
  
  .info-item:last-child { border-bottom: none; } /* Item terakhir tanpa garis */

  /* Sembunyikan titik dua (:) */
  .info-item span { display: none; }

  /* Label (Misal: Deskripsi, Lokasi) */
  .info-item strong {
    font-size: 0.8rem; /* Font label agak kecil */
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Isi Data (Misal: Cikole, Kota Sukabumi...) */
  .info-item p {
    font-size: 1rem; /* Font isi tetap jelas */
    color: #333;
    line-height: 1.4;
    font-weight: 500;
  }

  /* Foto & Carousel */
  .report-photos-right { max-width: 100%; margin-top: 10px; }
  .carousel-item { height: 220px; }

  /* Timeline Status (Biar teksnya ga nabrak) */
  .step-label { font-size: 0.65rem; margin-top: 5px; } 
  .progress-bar { top: 14px; }
  .step-dot { width: 12px; height: 12px; border-width: 3px; }
}
</style>