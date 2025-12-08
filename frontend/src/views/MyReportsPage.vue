<template>
  <div class="my-reports-page">
    <button class="btn-back" @click="router.push('/rescue')">Kembali</button>
    
    <h1 class="page-title">Daftar Laporan Anda</h1>

    <template v-if="loading">
      <div class="loading-state">
        <p>Sedang memuat laporan...</p>
      </div>
    </template>

    <template v-else-if="userReports.length === 0">
      <div class="empty-state">
        <p>Anda belum pernah membuat laporan rescue.</p>
        <button class="btn-aksi" @click="router.push({ name: 'FormLaporanRescue' })">Buat Laporan Sekarang</button>
      </div>
    </template>

    <template v-else>
      <div class="reports-list">
        <div v-for="report in userReports" :key="report.id" class="laporan-box-complete">
          
          <div class="laporan-content-wrapper">
            
            <div class="laporan-foto-complete">
              <img :src="report.gambar || '../assets/kucheng.png'" alt="Foto Kucing Ditemukan" class="card-image"/>
            </div>

            <div class="laporan-info-complete">
              
              <div class="status-and-id">
                  <h3 class="report-id">Laporan #{{ report.id }}</h3>
                  <span 
                        :class="[
                            'status-badge', 
                            report.status_display === 'Selesai' 
                                ? 'selesai'
                                : report.status_display === 'Sedang Diproses'
                                    ? 'sedang'
                                    : 'belum' 
                        ]"
                    >
                      {{ report.status_display }}
                  </span>
              </div>

              <div class="info-grid">
                  <div class="info-item">
                      <strong>Nama Pelapor</strong><span>:</span><p>{{ report.nama_pelapor || '-' }}</p>
                  </div>
                  <div class="info-item">
                      <strong>No. Telepon</strong><span>:</span><p>{{ report.telepon || '-' }}</p>
                  </div>
                  <div class="info-item">
                      <strong>Waktu Penemuan</strong><span>:</span><p>{{ formatWaktu(report.waktu_penemuan) }}</p>
                  </div>
                  <div class="info-item">
                      <strong>Lokasi</strong><span>:</span><p>{{ report.lokasi_penemuan || '-' }}</p>
                  </div>
                  <div class="info-item">
                      <strong>Tag</strong><span>:</span><p>{{ report.tags || 'Tidak Ada' }}</p>
                  </div>
              </div>

              <div class="info-description">
                  <strong>Deskripsi</strong><span>:</span>
                  <p>{{ report.deskripsi || 'Tidak ada deskripsi.' }}</p>
              </div>

            </div>
            
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from "../services/api"

const router = useRouter()
const userReports = ref([])
const loading = ref(true)

const formatWaktu = (waktu) => {
    if (!waktu) return '-';
    return new Date(waktu).toLocaleString('id-ID', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const fetchUserReports = async () => {
  loading.value = true;
  const ids = JSON.parse(localStorage.getItem('myRescueReports') || '[]')
  
  if (ids.length === 0) {
    userReports.value = []
    loading.value = false
    return
  }

  try {
    const idsString = ids.join(',')
    // Anda mungkin menggunakan API default, jadi kita gunakan:
    // Jika Anda sudah mengimpor rescueAPI: const res = await rescueAPI.getReportsByIds(idsString)
    const res = await axios.get(`/rescue?ids=${idsString}`) 
    
    // FIX: Tambahkan Optional Chaining (?. ) dan Nullish Coalescing (??)
    // Jika res.data.data ada, panggil .reverse(), jika tidak, gunakan array kosong ([]).
    userReports.value = res.data?.reverse() ?? []
    
    // Opsional: Cek di console apakah data berhasil diambil
    console.log("Data Laporan Diterima:", userReports.value.length); 

  } catch (err) {
    console.error("Gagal ambil Laporan Anda:", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchUserReports())
</script>

<style scoped>

.btn-back {
    background-color: #f8f9fa;
    color: #333;
    border: 1px solid #dee2e6;
    padding: 8px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1em;
    font-weight: 500;
    transition: all 0.2s ease-in-out;
    margin-bottom: 25px;
    display: inline-flex;
    align-items: center;
}

.btn-back:hover {
    background-color: #e9ecef;
    border-color: #c9d0d6;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-back::before {
    content: "←";
    font-size: 1.2em;
    line-height: 1;
    margin-right: 8px;
    font-weight: bold;
}

.my-reports-page {
    padding: 30px 20px;
    max-width: 900px;
    margin: 0 auto;
}

.page-title {
    color: var(--primary-color, #333);
    margin-bottom: 25px;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
}

.reports-list {
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.laporan-box-complete {
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    background: #fff;
    padding: 15px;
}

.laporan-content-wrapper {
    display: flex;
    gap: 20px;
    align-items: flex-start;
}

.laporan-foto-complete {
    flex-shrink: 0;
    width: 140px;
    height: 140px;
    border-radius: 6px;
    overflow: hidden;
}

.card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.laporan-info-complete {
    flex-grow: 1;
}

.status-and-id {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
    margin-bottom: 15px;
}

.report-id {
    font-size: 1.1em;
    color: var(--primary-color, #333);
    margin: 0;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 20px;
    margin-bottom: 15px;
}

.info-item {
    display: flex;
    align-items: baseline;
}

.info-item strong {
    flex-shrink: 0;
    margin-right: 5px;
    color: #555;
    font-size: 0.95em;
}

.info-item span {
    margin-right: 5px;
    color: #999;
}

.info-item p {
    margin: 0;
    flex-grow: 1;
    font-weight: 500;
}

.info-description {
    padding-top: 10px;
    border-top: 1px dashed #eee;
}

.info-description p {
    margin-top: 5px;
    font-style: italic;
    color: #666;
    line-height: 1.4;
}

/* Status Badge Styling */
.status-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.8em;
    font-weight: bold;
    color: #fff;
}

.status-badge.sedang {
    background-color: var(--status-sedang, #ffc107);
}

.status-badge.selesai {
    background-color: var(--status-selesai, #28a745);
}

/* Status Merah untuk status selain Sedang dan Selesai */
.status-badge.belum {
    background-color: #dc3545;
}

.btn-aksi {
    background-color: var(--primary, #007bff);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
}

.empty-state, .loading-state {
    text-align: center;
    padding: 50px 20px;
    border: 1px dashed #ccc;
    border-radius: 8px;
    margin-top: 30px;
}
</style>