<template>
  <div :class="$style.confirmationPage">
    <div :class="$style.container">

      <div v-if="loading" :class="$style.loadingState">
        <p>Memuat status transaksi...</p>
      </div>
      
      <div v-else-if="error" :class="$style.errorState">
        <p>Gagal memuat detail pembayaran: {{ error }}</p>
        <button @click="fetchPaymentData">Coba Lagi</button>
      </div>

      <div v-else-if="paymentData.kode_transaksi" :class="$style.confirmationContent">
        
        <div :class="$style.statusSection">
          <div :class="$style.iconWrapper" :style="{ backgroundColor: getStatusColor(paymentData.status) }">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                  <path v-if="paymentData.status === 'berhasil'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path v-else-if="paymentData.status === 'menunggu_verifikasi' || paymentData.status === 'menunggu'" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path v-else d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
          </div>
          
          <h1 :class="$style.title">{{ getStatusTitle(paymentData.status) }}</h1>
          <p :class="$style.subtitle">{{ getStatusSubtitle(paymentData.status) }}</p>
        </div>

        <div :class="$style.paymentDetails">
          <div :class="$style.detailCard">
            <h2 :class="$style.detailTitle">Detail Transaksi</h2>
            
            <div :class="$style.detailItem">
              <span :class="$style.detailLabel">Kode Transaksi</span>
              <span :class="$style.detailValue">{{ paymentData.kode_transaksi }}</span> 
            </div>
            
            <div :class="$style.detailItem">
              <span :class="$style.detailLabel">Status Saat Ini</span>
              <span :class="$style.detailValue" :style="{ color: getStatusColor(paymentData.status) }">
                **{{ formatStatus(paymentData.status) }}**
              </span>
            </div>
            
            <div :class="$style.detailItem">
              <span :class="$style.detailLabel">Total Donasi</span>
              <span :class="$style.detailValue">Rp {{ formatCurrency(paymentData.jumlah) }}</span>
            </div>
            
            <div :class="$style.detailItem">
              <span :class="$style.detailLabel">Metode Pembayaran</span>
              <span :class="$style.detailValue">{{ formatPaymentMethod(paymentData.metode_bayar) }}</span>
            </div>
            
            <div :class="$style.detailItem" v-if="paymentData.tanggal_bayar">
              <span :class="$style.detailLabel">Tanggal Bayar</span>
              <span :class="$style.detailValue">{{ formatDate(paymentData.tanggal_bayar) }}</span>
            </div>
            
          </div>

          <div :class="$style.instructionsCard" v-if="paymentData.riwayat_log && paymentData.riwayat_log.length > 0">
            <h3 :class="$style.instructionsTitle">Riwayat Transaksi:</h3>
            <ul :class="$style.logList">
              <li v-for="log in paymentData.riwayat_log" :key="log.id">
                [{{ formatDate(log.timestamp) }}] - Status berubah menjadi **{{ formatStatus(log.status) }}**
              </li>
            </ul>
          </div>
        </div>

        <div :class="$style.actionButtons">
            <button :class="$style.printBtn" @click="handlePrint">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 9V2H18V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18 14H6V22H18V14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Cetak Invoice
            </button>
            <button :class="$style.homeBtn" @click="goToHome">
              Kembali ke Beranda
            </button>
            <button :class="$style.donateBtn" @click="goToDonate">
              Donasi Lagi
            </button>
        </div>

        <div :class="$style.supportInfo">
          <p :class="$style.supportText">
            Butuh bantuan? 
            <button :class="$style.supportLink" @click="contactSupport">Hubungi Support</button>
            atau email ke support@meowment.org
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// 💡 PASTIKAN PATH INI SESUAI DENGAN LOKASI api.js ANDA
import { pembayaranAPI } from '../services/api'; 

const router = useRouter();
const route = useRoute();

const paymentData = ref({});
const loading = ref(true);
const error = ref(null);

// ===================================
// UTILITY FUNCTIONS
// ===================================

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0';
  return parseFloat(amount).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  // Fastify/MySQL biasanya mengembalikan string ISO, yang bisa langsung diproses
  const date = new Date(timestamp); 
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPaymentMethod = (method) => {
    switch (method) {
        case 'transfer_bank': return 'Transfer Bank';
        case 'qris': return 'QRIS';
        case 'e_wallet': return 'E-Wallet';
        default: return method;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'berhasil': return '#4CAF50'; // Hijau
        case 'menunggu_verifikasi': 
        case 'menunggu': return '#FF9800'; // Oranye
        case 'gagal': 
        case 'kedaluwarsa': return '#F44336'; // Merah
        default: return '#9E9E9E'; // Abu-abu
    }
};

const formatStatus = (status) => {
    switch (status) {
        case 'berhasil': return 'Berhasil';
        case 'menunggu': return 'Menunggu Pembayaran';
        case 'menunggu_verifikasi': return 'Menunggu Verifikasi (Bukti Terkirim)';
        case 'gagal': return 'Gagal';
        case 'kedaluwarsa': return 'Kedaluwarsa';
        default: return status;
    }
};

const getStatusTitle = (status) => {
    switch (status) {
        case 'berhasil': return 'Pembayaran Berhasil Diproses! 🎉';
        case 'menunggu_verifikasi': return 'Bukti Terkirim, Menunggu Verifikasi.';
        case 'menunggu': return 'Menunggu Pembayaran Anda';
        case 'gagal': return 'Pembayaran Gagal/Dibatalkan ❌';
        case 'kedaluwarsa': return 'Transaksi Kedaluwarsa ⏳';
        default: return 'Status Transaksi Tidak Diketahui';
    }
};

const getStatusSubtitle = (status) => {
    switch (status) {
        case 'berhasil': return 'Terima kasih telah berdonasi untuk teman berbulu kita.';
        case 'menunggu_verifikasi': return 'Kami sedang memverifikasi bukti pembayaran Anda. Proses ini memakan waktu maksimal 1x24 jam.';
        case 'menunggu': return `Segera selesaikan pembayaran sebelum ${formatDate(paymentData.value.waktu_kedaluwarsa)}.`;
        default: return 'Silakan hubungi dukungan jika Anda memiliki pertanyaan terkait transaksi ini.';
    }
};


// ===================================
// CORE API LOGIC
// ===================================

const fetchPaymentData = async () => {
    const kode_transaksi = route.query.kode_transaksi;
    if (!kode_transaksi) {
        error.value = 'Kode transaksi tidak ditemukan di URL.';
        loading.value = false;
        return;
    }
    
    loading.value = true;
    error.value = null;

    try {
        // Panggil API yang sudah kita buat di PaymentController.js
        const response = await pembayaranAPI.getStatus(kode_transaksi); 
        
        // Isi state dengan data dari API
        paymentData.value = response.data; 

    } catch (err) {
        error.value = err.message || 'Gagal mengambil detail transaksi. Cek koneksi API Anda.';
        console.error(err);
    } finally {
        loading.value = false;
    }
};

// ===================================
// ACTION BUTTONS
// ===================================

const handlePrint = () => {
  window.print();
};

const goToHome = () => {
  router.push({ name: 'Home' });
};

const goToDonate = () => {
  router.push({ name: 'Donate' });
};

const contactSupport = () => {
  alert('Silakan hubungi support melalui email atau media sosial.');
};

// ===================================
// LIFECYCLE
// ===================================

onMounted(() => {
  fetchPaymentData();
});
</script>

<style module>
/* ===================================== */
/* STYLING */
/* ===================================== */
.confirmationPage {
    min-height: 100vh;
    background-color: #f8f8f8;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 60px 20px;
}

.container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    max-width: 650px;
    width: 100%;
    padding: 40px;
    text-align: center;
}

.loadingState, .errorState {
    padding: 50px 0;
}

/* Status Section */
.statusSection {
    margin-bottom: 30px;
}

.iconWrapper {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    transition: background-color 0.3s;
}

.iconWrapper svg {
    color: white;
}

.title {
    font-size: 2rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 10px;
}

.subtitle {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 30px;
}

/* Payment Details */
.paymentDetails {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 30px;
}

.detailCard {
    text-align: left;
    background: #fafafa;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 24px;
}

.detailTitle, .instructionsTitle {
    font-size: 1.2rem;
    color: #9e7363;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0e0e0;
}

.detailItem {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
}

.detailLabel {
    color: #666;
    font-weight: 500;
}

.detailValue {
    font-weight: 600;
    color: #333;
}

/* Riwayat Log */
.instructionsCard {
    text-align: left;
    background: #f0f0f0;
    border-left: 4px solid #9e7363;
    padding: 24px;
    border-radius: 12px;
}

.logList {
    text-align: left;
    padding-left: 20px;
    font-size: 0.95rem;
    color: #333;
    margin-top: 10px;
}

.logList li {
    margin-bottom: 5px;
}

/* Action Buttons */
.actionButtons {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 30px;
}

.printBtn, .homeBtn, .donateBtn {
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.printBtn {
    background: white;
    border: 1px solid #ccc;
    color: #333;
}
.printBtn svg { color: #9e7363; }
.printBtn:hover {
    background: #f0f0f0;
}

.homeBtn {
    background: white;
    border: 1px solid #9e7363;
    color: #9e7363;
}
.homeBtn:hover {
    background: #f8f8f8;
}

.donateBtn {
    border: none;
    background: #9e7363;
    color: white;
}

.donateBtn:hover {
    background: #8a6252;
}

/* Support Info */
.supportInfo {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.supportText {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.supportLink {
  background: none;
  border: none;
  color: #9e7363;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

.supportLink:hover {
  color: #8a6252;
}

</style>