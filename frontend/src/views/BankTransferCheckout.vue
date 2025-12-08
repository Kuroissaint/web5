<template>
  <div :class="$style.checkoutPage">
    <div :class="$style.container">
      <div :class="$style.header">
        <button :class="$style.backButton" @click="handleBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Kembali
        </button>
        <h1 :class="$style.pageTitle">Checkout Donasi</h1>
      </div>

      <div v-if="loading" :class="$style.loadingState">
        <p>Memuat detail pembayaran...</p>
      </div>

      <div v-else-if="error" :class="$style.errorState">
        <p>Gagal memuat detail pembayaran: {{ error }}</p>
        <button @click="fetchPaymentDetails">Coba Lagi</button>
      </div>

      <div v-else :class="$style.mainContent">
        <div :class="$style.orderSummary">
          <h2 :class="$style.summaryTitle">Transfer Bank - {{ bankName }}</h2>
          
          <div :class="$style.bankDetails">
            <div :class="$style.detailItem">
              <span :class="$style.detailLabel">Kode Transaksi</span>
              <span :class="$style.detailValue">{{ paymentData.kode_transaksi }}</span>
            </div>
            
            <div :class="$style.detailItem">
              <span :class="$style.detailLabel">Nomor Virtual Account</span>
              <span :class="$style.detailValue">{{ paymentData.va_number || 'Tidak Tersedia' }}</span>
              <button @click="copyToClipboard(paymentData.va_number)" :class="$style.copyBtn">Salin</button>
            </div>

            <div :class="$style.detailItem">
              <span :class="$style.detailLabel">Total Bayar</span>
              <span :class="[$style.detailValue, $style.highlightAmount]">Rp {{ formatCurrency(paymentData.jumlah) }}</span>
              <button @click="copyToClipboard(paymentData.jumlah)" :class="$style.copyBtn">Salin</button>
            </div>

            <div :class="$style.detailItem">
              <span :class="$style.detailLabel">Batas Waktu Pembayaran</span>
              <span :class="$style.detailValue">{{ formatExpiryTime(paymentData.waktu_kedaluwarsa) }}</span>
            </div>
          </div>
          
          <h3 :class="$style.summaryTitle">Ringkasan Donasi</h3>
          <div :class="$style.summaryDetails">
            <div :class="$style.summaryItem">
              <span :class="$style.summaryLabel">Nominal Donasi</span>
              <span :class="$style.summaryValue">Rp {{ formatCurrency(paymentData.jumlah) }}</span>
            </div>
            </div>
        </div>

        <div :class="$style.paymentFormSection">
          <h2 :class="$style.formTitle">Konfirmasi Transfer</h2>

          <div :class="$style.formGroup">
            <label :class="$style.formLabel" for="proof">Unggah Bukti Pembayaran</label>
            <input 
              type="file" 
              id="proof" 
              ref="fileInput"
              accept="image/*, application/pdf"
              @change="handleFileChange"
              :class="$style.fileInput"
            />
            <p v-if="fileName" :class="$style.fileName">File terpilih: **{{ fileName }}**</p>
          </div>

          <p v-if="uploadError" :class="$style.uploadError">Error: {{ uploadError }}</p>

          <div :class="$style.actionButtons">
            <button 
              @click="handleCancel" 
              :class="$style.cancelBtn"
              :disabled="isUploading"
            >
              Batalkan
            </button>
            <button 
              @click="uploadBukti" 
              :class="[$style.confirmBtn, { [$style.confirmBtnDisabled]: !selectedFile || isUploading }]"
              :disabled="!selectedFile || isUploading"
            >
              {{ isUploading ? 'Mengunggah...' : 'Konfirmasi Pembayaran' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// Asumsi path import ke api.js
import { pembayaranAPI } from '../services/api'; 

const route = useRoute();
const router = useRouter();

// State
const paymentData = ref({});
const selectedFile = ref(null);
const fileName = ref('');
const loading = ref(true);
const isUploading = ref(false);
const error = ref(null);
const uploadError = ref(null);

// Computed Properties
const bankName = computed(() => {
  // Logic nyata harus memetakan va_number atau field metode_bayar ke nama bank
  return 'Bank BCA (Contoh)'; 
});

// Methods
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0';
  return amount.toLocaleString('id-ID');
};

const formatExpiryTime = (datetime) => {
  if (!datetime) return 'N/A';
  const date = new Date(datetime);
  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const handleBack = () => {
  router.back();
};

const handleCancel = () => {
    // Navigasi ke halaman Donasi atau halaman Home
    router.push({ name: 'Donate' }); 
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    fileName.value = file.name;
    uploadError.value = null; // Bersihkan error sebelumnya
  } else {
    selectedFile.value = null;
    fileName.value = '';
  }
};

/**
 * 1. Mengambil Detail Pembayaran dari Backend
 */
const fetchPaymentDetails = async () => {
  const kode_transaksi = route.query.kode_transaksi;
  if (!kode_transaksi) {
    error.value = 'Kode transaksi tidak ditemukan.';
    loading.value = false;
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await pembayaranAPI.getStatus(kode_transaksi);
    paymentData.value = response.data;

    // Jika status sudah final, langsung redirect ke konfirmasi
    if (['berhasil', 'gagal', 'kedaluwarsa'].includes(paymentData.value.status)) {
        router.replace({ name: 'PaymentConfirmation', query: { kode_transaksi: kode_transaksi } });
    }

  } catch (err) {
    error.value = err.message || 'Gagal mengambil detail pembayaran.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};


/**
 * 2. Mengunggah Bukti Pembayaran ke Backend
 */
const uploadBukti = async () => {
  if (!selectedFile.value) {
    uploadError.value = 'Silakan pilih file bukti pembayaran.';
    return;
  }
  
  isUploading.value = true;
  uploadError.value = null;
  
  try {
    const kode_transaksi = paymentData.value.kode_transaksi;

    // Membuat FormData untuk mengirim file dan field teks
    const formData = new FormData();
    formData.append('kode_transaksi', kode_transaksi);
    
    // 🔥 PERBAIKAN KRITIS DI SINI: Ubah nama field menjadi 'file'
    formData.append('file', selectedFile.value); 

    await pembayaranAPI.uploadBukti(formData);

    // Sukses: Redirect ke halaman konfirmasi dengan status 'menunggu_verifikasi'
    router.replace({ 
      name: 'PaymentConfirmation', 
      query: { 
        kode_transaksi: kode_transaksi, 
        status: 'menunggu_verifikasi' 
      } 
    });

  } catch (err) {
    uploadError.value = err.message || 'Gagal mengunggah bukti pembayaran.';
    console.error(err);
  } finally {
    isUploading.value = false;
  }
};

const copyToClipboard = (text) => {
    if (!navigator.clipboard) {
        alert("Fungsi salin tidak didukung oleh browser ini.");
        return;
    }
    navigator.clipboard.writeText(text.toString());
    alert('Teks berhasil disalin!');
};

// Lifecycle Hook
onMounted(() => {
  fetchPaymentDetails();
});
</script>

<style module>
/* PENTING: Anda harus menambahkan CSS di sini agar tampilan sesuai desain */
.checkoutPage {
    min-height: 100vh;
    background-color: #f8f8f8;
    display: flex;
    justify-content: center;
    padding: 40px 20px;
}

.container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    max-width: 1000px;
    width: 100%;
    padding: 40px;
}

.header {
    margin-bottom: 30px;
    display: flex;
    align-items: center;
}

.backButton {
    background: none;
    border: none;
    cursor: pointer;
    color: #9e7363;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 1rem;
    padding: 0;
}

.pageTitle {
    font-size: 1.8rem;
    font-weight: 700;
    color: #333;
    margin-left: 20px;
}

.mainContent {
    display: flex;
    gap: 40px;
}

.orderSummary {
    flex: 1.5;
    padding-right: 20px;
    border-right: 1px solid #eee;
}

.paymentFormSection {
    flex: 1;
}

.summaryTitle, .formTitle {
    font-size: 1.4rem;
    color: #9e7363;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #f6c590;
}

.bankDetails, .summaryDetails {
    margin-bottom: 30px;
}

.detailItem, .summaryItem {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px dashed #eee;
}

.detailLabel, .summaryLabel {
    color: #666;
    font-weight: 500;
}

.detailValue, .summaryValue {
    font-weight: 600;
    color: #333;
}

.highlightAmount {
    font-size: 1.2rem;
    color: #9e7363;
}

.copyBtn {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    font-size: 0.9rem;
    margin-left: 10px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.2s;
}

.copyBtn:hover {
    background: #f0f8ff;
}

.formGroup {
    margin-bottom: 20px;
}

.formLabel {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
}

.fileInput {
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 4px;
    width: 100%;
}

.fileName {
    margin-top: 8px;
    font-size: 0.9rem;
    color: #666;
}

.uploadError {
    color: red;
    margin-top: 10px;
}

.actionButtons {
    display: flex;
    gap: 16px;
    margin-top: 30px;
}

.cancelBtn, .confirmBtn {
    flex: 1;
    padding: 14px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.cancelBtn {
    border: 2px solid #9e7363;
    background: white;
    color: #9e7363;
}

.cancelBtn:hover {
    background: #f8f8f8;
}

.confirmBtn {
    border: none;
    background: #9e7363;
    color: white;
}

.confirmBtn:hover:not(:disabled) {
    background: #8a6252;
}

.confirmBtnDisabled {
    background: #ccc !important;
    cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 900px) {
    .mainContent {
        flex-direction: column;
    }
    .orderSummary {
        border-right: none;
        padding-right: 0;
        border-bottom: 1px solid #eee;
        padding-bottom: 30px;
        margin-bottom: 30px;
    }
}
</style>