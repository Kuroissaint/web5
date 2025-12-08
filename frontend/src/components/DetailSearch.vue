<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Memuat data kucing...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button class="btn-back" @click="$emit('close')">Tutup</button>
      </div>

      <div v-else class="detail-page-content">
        
        <div class="action-buttons">
          <button class="btn-back" @click="$emit('close')"> 
            <span class="back">← Kembali</span>
          </button>
          
          <a v-if="contactPhone" :href="`https://wa.me/${formatPhone(contactPhone)}`" target="_blank" class="btn-contact">
            <span class="icon">📞</span> Hubungi Pelapor
          </a>
        </div>

        <div class="detail-content-wrapper">
          
          <div class="photo-section">
            <div class="photo-main">
              <img :src="activePhoto || '/src/assets/kucheng.png'" :alt="cat.nama_kucing" class="main-img" />
            </div>
            <div v-if="photoList.length > 1" class="thumbnails-wrapper">
              <div 
                v-for="(photo, index) in photoList" 
                :key="index" 
                class="thumbnail"
                :class="{ 'active': activePhoto === photo }"
                @click="activePhoto = photo"
              >
                <img :src="photo" alt="thumb" />
              </div>
            </div>
          </div>

          <div class="detail-info">
            <h2 class="cat-name">{{ cat.nama_kucing || 'Kucing Hilang' }}</h2>
            
            <div class="info-grid">
              <div class="info-row">
                <span class="label">Status</span>
                <span class="value"><span class="status-badge">{{ cat.status || 'Hilang' }}</span></span>
              </div>
              
              <div class="info-row">
                <span class="label">Pelapor</span>
                <span class="value">{{ cat.nama_pelapor || 'Anonim' }}</span>
              </div>

              <div class="info-row">
                <span class="label">Jenis/Ras</span>
                <span class="value">{{ cat.jenis_kucing || cat.ras || '-' }}</span>
              </div>

              <div class="info-row">
                <span class="label">Lokasi</span>
                <span class="value">{{ cat.lokasi_display || cat.lokasi_terakhir || '-' }}</span>
              </div>

              <div class="info-row">
                <span class="label">Waktu Hilang</span>
                <span class="value">{{ formatDate(cat.waktu_hilang) }}</span>
              </div>

              <div class="info-row" v-if="cat.tags">
                <span class="label">Ciri-ciri</span>
                <div class="tags-list">
                  <span v-for="tag in splitTags(cat.tags)" :key="tag" class="mini-tag">{{ tag }}</span>
                </div>
              </div>
            </div>

            <div class="description-box">
              <strong>Deskripsi / Kronologi:</strong>
              <p>{{ cat.deskripsi || 'Tidak ada deskripsi tambahan.' }}</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import API from '../services/api';

const props = defineProps({
  catId: { type: [String, Number], required: true }
});

const emit = defineEmits(['close']);

// State
const cat = ref({});
const loading = ref(true);
const error = ref(null);
const photoList = ref([]);
const activePhoto = ref('');

// Computed untuk nomor telepon
const contactPhone = computed(() => {
  return cat.value.kontak_pelapor || cat.value.telepon;
});

// Fetch Data
onMounted(async () => {
  try {
    loading.value = true;
    const response = await API.get(`/kucing/${props.catId}`);
    
    // Handle struktur response yang mungkin berbeda
    if(response.data) {
        const data = response.data.data || response.data; // Handle wrapped or direct data
        cat.value = data;

        // Logic Foto
        if (data.list_foto_url) {
          photoList.value = data.list_foto_url.split(',');
        } else if (data.foto) {
          photoList.value = [data.foto];
        } else {
          photoList.value = [];
        }

        if (photoList.value.length > 0) {
          activePhoto.value = photoList.value[0];
        }
    }
  } catch (err) {
    console.error("Detail Error:", err);
    error.value = "Gagal memuat data kucing.";
  } finally {
    loading.value = false;
  }
});

// Helpers
function formatPhone(phone) {
  if (!phone) return '';
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('0')) return '62' + p.substring(1);
  if (p.startsWith('62')) return p;
  return '62' + p;
}

function formatDate(dateString) {
  if(!dateString) return '-';
  const date = new Date(dateString);
  // Cek valid date
  if (isNaN(date.getTime())) return dateString; 
  
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('id-ID', options);
}

function splitTags(tagsString) {
  if (!tagsString) return [];
  return tagsString.split(',');
}
</script>

<style scoped>
/* Gunakan style yang sama seperti sebelumnya */
/* Overlay Gelap */
.modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000; backdrop-filter: blur(4px);
}

/* MODAL BOX */
.modal-box {
    background-color: var(--browny, #8B5E3C);
    border-radius: 20px;
    padding: 0; 
    width: 95%; 
    max-width: 1200px; 
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    max-height: 90vh; 
    overflow-y: auto;
    overflow-x: hidden;
}

.detail-page-content { padding: 30px; }

.action-buttons { display: flex; justify-content: space-between; margin-bottom: 20px; }
.btn-back {
    background: #333; color: white; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
.btn-contact {
    background: #25D366; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
.btn-contact:hover { background: #1ebc57; }

.detail-content-wrapper {
    background-color: white; 
    border-radius: 16px;
    padding: 30px;
    display: flex; gap: 30px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

/* Photo */
.photo-section { flex: 1.3; display: flex; flex-direction: column; gap: 15px; }
.photo-main {
    width: 100%; height: 500px; border-radius: 12px; overflow: hidden; background: #f9f9f9; border: 1px solid #eee;
}
.main-img { width: 100%; height: 100%; object-fit: contain; }

.thumbnails-wrapper { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; }
.thumbnail {
    width: 70px; height: 70px; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid transparent; opacity: 0.6; transition: 0.2s;
}
.thumbnail img { width: 100%; height: 100%; object-fit: cover; }
.thumbnail:hover, .thumbnail.active { opacity: 1; border-color: var(--primary); }

/* Info */
.detail-info { flex: 1; display: flex; flex-direction: column; gap: 15px; }
.cat-name { font-size: 2.2rem; margin: 0 0 10px 0; color: var(--dark); font-family: 'Poppins', sans-serif; }

.info-grid { display: flex; flex-direction: column; gap: 12px; }
.info-row { display: grid; grid-template-columns: 110px 1fr; align-items: flex-start; }
.info-row .label { font-weight: 600; color: #888; font-size: 0.95rem; }
.info-row .value { font-weight: 500; color: #333; line-height: 1.5; }

.tags-list { display: flex; flex-wrap: wrap; gap: 6px; }
.mini-tag { background: #e0d4cc; color: #5d4037; padding: 4px 12px; border-radius: 15px; font-size: 0.8rem; font-weight: 600; }

.description-box { margin-top: 20px; line-height: 1.6; color: #555; padding-top: 20px; border-top: 1px dashed #eee; }
.status-badge { background: #ffe3c7; color: #8d5e46; padding: 4px 10px; border-radius: 6px; font-weight: bold; text-transform: uppercase; font-size: 0.85rem; }

@media (max-width: 768px) {
    .modal-overlay { padding: 10px; }
    .detail-content-wrapper { flex-direction: column; padding: 20px; gap: 20px; }
    .photo-main { height: 300px; }
    .info-row { grid-template-columns: 1fr; gap: 4px; }
    .action-buttons { position: sticky; top: 0; z-index: 5; }
}
</style>