<template>
  <div class="search-page-container">
    
    <div class="filter-section">
      <div class="filter-controls-group">
        
        <div class="button-group-left">
          <router-link :to="{ name: 'MySearch' }" class="button button-filter"> 
            <div class="search-tag">Laporan Anda</div>
          </router-link>
        </div>
        
        <div class="location-filter-group">
          <select v-model="selectedProvinsi" @change="fetchKota" class="custom-select mb-2">
            <option value="">Semua Provinsi</option>
            <option v-for="prov in listProvinsi" :key="prov.id" :value="prov">
              {{ prov.nama_provinsi }}
            </option>
          </select>

          <select 
            v-model="selectedKota" 
            @change="performSearch" 
            class="custom-select"
            :disabled="!selectedProvinsi"
          >
            <option value="">Semua Kota/Kab</option>
            <option v-for="kota in listKota" :key="kota.id" :value="kota.nama_kabupaten_kota">
              {{ kota.nama_kabupaten_kota }}
            </option>
          </select>
        </div>

        <div class="search-input-center">
          <div class="select-field" @click="toggleDropdown">
            <div class="select-value">
              {{ selectedTag ? selectedTag : "Pilih Ciri / Tag" }}
            </div>
            <span class="chevron-down">▼</span>
          </div>

          <div v-if="dropdownOpen" class="dropdown-list">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari tag..."
              class="dropdown-search"
            />
            <div
              v-for="tag in filteredTags"
              :key="tag"
              class="dropdown-item"
              @click="selectTag(tag)"
            >
              {{ tag }}
            </div>
          </div>
        </div>

        <div class="button-group-right">
           <router-link :to="{ name: 'Report' }" class="button-report">
            <div class="search-tag">Buat Laporan</div>
          </router-link>
        </div>
      </div>

      <div class="tag-sect" v-if="selectedTags.length > 0">
        <div class="tag" v-for="(tag, index) in selectedTags" :key="index">
          <div class="search-tag">{{ tag }}</div>
          <div class="x" @click="removeTag(index)">×</div>
        </div>
      </div>
    </div>
    
    <h1 class="page-title">Bantu Orang Lain Menemukan Kucingnya 🐾</h1>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Mencari kucing...</p>
    </div>

    <div v-else class="results-grid">
      
      <div v-if="allCats.length === 0" class="empty-state-container">
        <img src="../assets/kucingOyen.png" class="empty-img" />
        <p>Belum ada laporan kucing hilang yang cocok.</p>
        <button class="btn-reset" @click="resetFilter">Reset Filter</button>
      </div>

      <div 
        v-for="cat in allCats" 
        :key="cat.id" 
        class="cat-card"
      >
        <div class="card-image">
          <img :src="cat.foto || '/src/assets/kucheng.png'" :alt="cat.nama_kucing" />
        </div>

        <div class="card-details">
          <div class="reporter-badge">
            <span class="icon">👤</span> {{ cat.nama_pelapor || 'Pelapor' }}
          </div>

          <p><strong>Nama</strong> : {{ cat.nama_kucing }}</p>
          <p><strong>Status</strong> : <span class="status-badge">{{ cat.status }}</span></p>
          <p><strong>Jenis</strong> : {{ cat.jenis_kucing || cat.ras || '-' }}</p>
          <p><strong>Lokasi</strong> : {{ cat.lokasi_display || 'Tidak diketahui' }}</p>
          
          <p v-if="cat.tags" class="tags-truncate"><strong>Ciri</strong> : {{ cat.tags }}</p>
          
          </div>

        <div class="card-actions">
          <button class="btn-secondary" @click="openModal(cat.id)">
            Detail
          </button>
          
          <a 
            v-if="cat.kontak_pelapor || cat.telepon"
            :href="getWaLink(cat)" 
            target="_blank" 
            class="btn-primary"
          >
            Saya Menemukan!
          </a>
        </div>
      </div>
    </div>

    <transition name="fade-pop">
      <DetailSearch 
        v-if="isModalOpen" 
        :cat-id="selectedCatId" 
        @close="closeModal"
      />
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import DetailSearch from '../components/DetailSearch.vue';
import { searchKucing } from '../services/api';
import API from '../services/api'; 

// --- STATE ---
const allTags = ref([]); 
const allCats = ref([]);
const loading = ref(false);

// Filter Lokasi State
const listProvinsi = ref([]);
const listKota = ref([]);
const selectedProvinsi = ref(""); // Object Provinsi
const selectedKota = ref("");     // String Nama Kota (untuk dikirim ke backend)

// Filter Tag State
const dropdownOpen = ref(false);
const searchQuery = ref("");
const selectedTag = ref(null);
const selectedTags = ref([]);

// --- 1. LOAD DATA AWAL ---
onMounted(async () => {
  loadDataMaster();
  loadKucing();
});

async function loadDataMaster() {
  try {
    // Load Tags
    const tagRes = await API.get('/tags');
    if (tagRes.data) {
        allTags.value = tagRes.data.map(t => t.nama_tag);
    }

    // Load Provinsi
    const provRes = await API.get('/wilayah/provinsi');
    if (provRes.data) {
        listProvinsi.value = provRes.data;
    }
  } catch (e) {
    console.error("Gagal load data master", e);
  }
}

// --- 2. LOGIC LOKASI (Bertingkat) ---
async function fetchKota() {
  // Reset Kota saat ganti Provinsi
  selectedKota.value = "";
  listKota.value = [];
  
  // Jika Provinsi di-unselect (kosong), reset pencarian ke "Semua Lokasi"
  if (!selectedProvinsi.value) {
    performSearch(); 
    return;
  }

  try {
    // Ambil data kota berdasarkan ID Provinsi yang dipilih
    const res = await API.get(`/wilayah/kota/${selectedProvinsi.value.id}`);
    listKota.value = res.data.data;
    
    // Otomatis search berdasarkan Provinsi yang baru dipilih
    performSearch(); 
  } catch (e) {
    console.error(e);
  }
}

// --- 3. FUNGSI SEARCH ---
async function loadKucing() {
  await performSearch();
}

async function performSearch() {
  loading.value = true;
  try {
    const filters = {};
    
    // 1. Filter Tag (Gabungkan array jadi string spasi)
    if (selectedTags.value.length > 0) {
      filters.q = selectedTags.value.join(' ');
    }
    
    // 2. Filter Lokasi
    // Kirim "Nama Kota" jika ada, atau "Nama Provinsi" jika hanya provinsi dipilih
    if (selectedKota.value) {
      filters.lokasi = selectedKota.value; 
    } else if (selectedProvinsi.value) {
      filters.lokasi = selectedProvinsi.value.nama_provinsi;
    }
    
    console.log("🔍 Mengirim Filter:", filters); // Debugging

    const response = await searchKucing(filters);
    allCats.value = response.data;
  } catch (error) {
    console.error('Search error:', error);
    allCats.value = [];
  } finally {
    loading.value = false;
  }
}

function getWaLink(cat) {
  const phone = cat.kontak_pelapor || cat.telepon;
  if (!phone) return '#';
  
  // Format nomor 08xx jadi 628xx
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('0')) p = '62' + p.substring(1);
  
  const text = `Halo ${cat.nama_pelapor}, saya melihat kucing Anda "${cat.nama_kucing}" yang hilang di Meowment. Bisa kita bicara?`;
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}

function resetFilter() {
  selectedTags.value = [];
  selectedProvinsi.value = "";
  selectedKota.value = "";
  listKota.value = [];
  performSearch();
}

// --- UI Helper (Tags) ---
const filteredTags = computed(() => {
  return allTags.value.filter(tag =>
    tag.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
    !selectedTags.value.includes(tag)
  );
});

function toggleDropdown() { dropdownOpen.value = !dropdownOpen.value; }

function selectTag(tag) {
  if (!selectedTags.value.includes(tag)) selectedTags.value.push(tag);
  selectedTag.value = tag;
  dropdownOpen.value = false;
  searchQuery.value = "";
  performSearch();
}

function removeTag(index) {
  selectedTags.value.splice(index, 1);
  performSearch();
}

// Modal Logic
const isModalOpen = ref(false);
const selectedCatId = ref(null);

function openModal(id) {
  selectedCatId.value = id;
  isModalOpen.value = true;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  isModalOpen.value = false;
  selectedCatId.value = null;
  document.body.style.overflow = 'auto';
}
</script>

<style scoped>
.search-page-container {
  background-color: var(--browny);
  padding: 32px 64px;
  min-height: 85vh;
  padding-bottom: 64px;
}

/* Container Filter */
.filter-controls-group {
  display: flex;
  align-items: flex-start; /* Supaya dropdown lokasi rapi di atas */
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* Group Lokasi (Provinsi & Kota) */
.location-filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
  flex: 1;
}

.custom-select {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  background-color: white;
  color: var(--dark);
  cursor: pointer;
  font-size: 0.9rem;
}
.custom-select:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
  color: #999;
}

/* Container Tombol (Grid 2 Kolom) */
.card-actions {
  padding: 15px 20px 20px; /* Atas Kanan Bawah Kiri */
  display: grid;
  grid-template-columns: 1fr 1.2fr; /* Tombol kanan lebih lebar dikit */
  gap: 10px;
  border-top: 1px solid #f5f5f5;
}

/* Tombol Detail (Secondary) */
.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn-secondary:hover {
  background-color: #e5e7eb;
}

/* Tombol Menemukan (Primary - Hijau/Coklat) */
.btn-primary {
  background-color: #25D366; /* Hijau WA */
  /* Atau kalau mau coklat: var(--dark) */
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  transition: 0.2s;
  box-shadow: 0 2px 5px rgba(37, 211, 102, 0.2);
}
.btn-primary:hover {
  background-color: #1ebc57;
  transform: translateY(-1px);
}

/* Truncate Tag biar gak kepanjangan */
.tags-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  color: #888;
  font-size: 0.85rem;
}

.button-group-left { display: flex; align-items: center; height: 42px; }
.button-filter, .button-report {
  border-radius: 8px; background-color: var(--dark); border: 1px solid var(--dark);
  padding: 0 20px; height: 42px; /* Tinggi disamakan */
  display: flex; align-items: center; justify-content: center;
  color: white; cursor: pointer; min-width: 128px; text-decoration: none; font-weight: 600;
}
.search-input-center { flex: 2; position: relative; }
.select-field {
  background-color: white; border: 1px solid #d9d9d9; border-radius: 8px;
  padding: 0 16px; height: 42px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;
}
.dropdown-list { 
  position: absolute; 
  top: 105%; width: 100%; 
  background: white; 
  border-radius: 8px; 
  box-shadow: 0 4px 10px rgba(0,0,0,0.1); 
  max-height: 250px; 
  overflow-y: auto; 
  z-index: 10; 
}

.dropdown-item { 
  padding: 10px 12px; 
  cursor: pointer; 
}

.dropdown-item:hover { 
  background: #f8f8f8; 
}
.dropdown-search { 
  width: 100%; 
  border: none; 
  border-bottom: 1px solid #eee; 
  padding: 10px; 
  outline: none; 
}

.tag-sect { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 8px; 
  margin-bottom: 30px; 
}

.tag { 
  background: var(--dark); 
  color: white; padding: 6px 12px; 
  border-radius: 20px; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  font-size: 0.9rem; 
}

.x { cursor: pointer; 
  font-weight: bold; 
}

.page-title { 
  font-family: 'Poppins', sans-serif; 
  color: var(--dark); 
  margin-bottom: 30px; 
  font-size: 1.8rem; 
}

.results-grid { 
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); 
  gap: 40px; 
  gap: 20px;
}

.cat-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #eaeaea;
  box-shadow: 0 6px 15px rgba(0,0,0,0.06);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%; /* Biar tinggi kartu sama rata */
}

.cat-card:hover { 
  transform: translateY(-5px); 
  box-shadow: 0 12px 25px rgba(0,0,0,0.1); /* Shadow lebih nyata pas hover */
  border-color: #ddd; /* Border sedikit lebih gelap pas hover */
}

.card-image { 
  height: 240px; 
  overflow: hidden; 
  position: relative;
  border-bottom: 1px solid #eaeaea;
}

.card-image img { 
  width: 100%; 
  height: 350px; 
  object-fit: cover; 
  transition: transform 0.5s ease;
}

/* Content grow biar tombol selalu di bawah */
.card-details {
  padding: 20px;
  flex-grow: 1;
  color: #444;
  font-size: 0.9rem;
  line-height: 1.5;
}

.cat-card:hover .card-image img {
  transform: scale(1.05);
}

.card-details p { 
  margin-bottom: 10px; 
  line-height: 1.6; 
}

.card-details strong {
  min-width: 70px;
  display: inline-block;
}

.reporter-badge {
  font-size: 0.85rem;
  color: #666;
  background-color: #f5f5f5;
  padding: 4px 10px;
  border-radius: 15px;
  display: inline-block;
  margin-bottom: 16px; /* Jarak ke Nama Kucing */
  font-weight: 600;
  border: 1px solid #eee;
}

.reporter-badge .icon {
  margin-right: 6px;
  font-size: 0.9rem;
}

.status-badge {
  background: #fff0e0; /* Warna sedikit lebih soft */
  color: #d35400;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.deskripsi-text {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #eee; /* Garis putus-putus pemisah deskripsi */
  font-style: italic;
  color: #666;
  font-size: 0.9rem;
}

.btn-selengkapnya {
  width: 100%;
  padding: 16px; /* Tombol lebih tebal */
  background: var(--dark);
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  font-size: 1rem;
  letter-spacing: 0.5px;
}

.btn-selengkapnya:hover { 
  background: #5a463a; 
}

.empty-state-container { 
  grid-column: 1 / -1; 
  text-align: center; 
  padding: 50px; 
  background: rgba(255,255,255,0.6); 
  border-radius: 20px; 
}

.empty-img { 
  width: 100px; 
  margin-bottom: 15px; 
  opacity: 0.7; 
}

.btn-reset { 
  margin-top: 15px; 
  padding: 10px 20px; 
  border: 1px solid var(--dark); 
  background: transparent; 
  color: var(--dark); 
  border-radius: 8px; 
  cursor: pointer; 
}

@media (max-width: 768px) {
  .search-page-container {
    padding: 20px 16px; /* Padding lebih kecil */
  }

  .page-title {
    font-size: 1.5rem;
    margin-bottom: 20px;
    text-align: center;
  }

  /* Filter jadi vertikal */
  .filter-controls-group {
    flex-direction: column;
    gap: 12px;
  }

  .button-group-left, .button-group-right, 
  .location-filter-group, .search-input-center {
    width: 100%; /* Semua elemen full width */
  }

  .button-filter, .button-report {
    width: 100%; /* Tombol jadi panjang */
  }

  /* Grid Card jadi 1 kolom di HP kecil */
  .results-grid {
    grid-template-columns: 1fr; 
  }
  
  .card-image {
    height: 200px; /* Gambar agak pendek di HP */
  }
}
</style>