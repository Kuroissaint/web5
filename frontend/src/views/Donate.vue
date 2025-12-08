<template>
  <div :class="$style.donatePage">
    <div :class="$style.container">
      <div :class="$style.mainContent">
        <div :class="$style.imageSection">
          <img :class="$style.donationImage" alt="Donation Illustration" src="../assets/173 2.png" />
        </div>

        <div :class="$style.formSection">
          <div :class="$style.header">
            <div :class="$style.logoSection">
              <h1 :class="$style.logoText">Meowment</h1>
            </div>
            <p :class="$style.welcomeText">Selamat datang di laman donasi Meowment</p>
          </div>

          <div :class="$style.donationForm">

            <div :class="$style.formGroup">
              <label :class="$style.sectionLabel">Pilih nominal donasi</label>
              <div :class="$style.amountOptions">
                <div 
                  v-for="amount in presetAmounts" 
                  :key="amount"
                  :class="[$style.amountOption, selectedAmount === amount && $style.amountOptionActive]"
                  @click="selectAmount(amount)"
                >
                  <div :class="$style.radioCircle"></div>
                  <span :class="$style.amountText">Rp.{{ amount.toLocaleString('id-ID') }}</span>
                </div>
              </div>
              </div>

            <div :class="$style.formGroup">
              <label :class="$style.sectionLabel">Frekuensi donasi</label>
              <div :class="$style.frequencyOptions">
                <div 
                  :class="[$style.frequencyOption, donation.frequency === 'sekali' && $style.frequencyOptionActive]"
                  @click="selectFrequency('sekali')"
                >
                  <div :class="$style.radioCircle"></div>
                  <span :class="$style.frequencyText">Sekali</span>
                </div>
                <div 
                  :class="[$style.frequencyOption, donation.frequency === 'bulanan' && $style.frequencyOptionActive]"
                  @click="selectFrequency('bulanan')"
                >
                  <div :class="$style.radioCircle"></div>
                  <span :class="$style.frequencyText">Bulanan</span>
                </div>
              </div>
            </div>
            
            <p v-if="donationError" :class="$style.errorText">{{ donationError }}</p>

            <div :class="$style.formGroup">
              <label :class="$style.sectionLabel">Pilih metode pembayaran</label>
              <div :class="$style.paymentOptions">
                <div 
                  v-for="method in paymentMethods" 
                  :key="method.value"
                  :class="[$style.paymentOption, donation.paymentMethod === method.value && $style.paymentOptionActive]"
                  @click="selectPaymentMethod(method.value)"
                >
                  <div :class="$style.radioCircle"></div>
                  <span :class="$style.paymentText">{{ method.label }}</span>
                  <img :src="method.icon" :alt="method.label" :class="$style.paymentIcon" />
                </div>
              </div>
            </div>

            <div :class="$style.actionButtons">
              <button :class="$style.cancelBtn" @click="handleCancel">
                Batal
              </button>
              <button 
                :class="[$style.checkoutBtn, !isFormValid && $style.checkoutBtnDisabled]" 
                @click="handleCheckout"
                :disabled="!isFormValid || loading"
              >
                {{ loading ? 'Memuat...' : 'Lanjut ke Pembayaran' }}
              </button>
            </div>

          </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
// ✅ Import pembayaranAPI juga
import { donasiAPI, pembayaranAPI } from '../services/api'; 
import bankIcon from '../assets/Bank.png';
import qrisIcon from '../assets/Qris.png';

// State
const router = useRouter();
const loading = ref(false);
const donationError = ref('');

const donation = ref({
  userId: 1, 
  amount: 0,
  frequency: 'sekali',
  fullName: 'Anonim', 
  email: 'anonim@meowment.id', 
  phoneNumber: '08123456789', 
  supportMessage: '', 
  paymentMethod: '', 
});

const presetAmounts = [10000, 25000, 50000];
const selectedAmount = ref(0);

const paymentMethods = [
  { label: 'Transfer Bank (BCA, Mandiri, dll)', value: 'transfer_bank', icon: bankIcon },
  { label: 'QRIS (Gopay, OVO, Dana, dll)', value: 'qris', icon: qrisIcon },
];

// Computed Properties
const isFormValid = computed(() => {
  return (
    donation.value.amount > 0 &&
    donation.value.paymentMethod !== ''
  );
});

// Methods
const selectAmount = (amount) => {
  selectedAmount.value = amount;
  donation.value.amount = amount;
};

const selectFrequency = (frequency) => {
  donation.value.frequency = frequency;
};

const selectPaymentMethod = (method) => {
  donation.value.paymentMethod = method;
};

const handleCancel = () => {
  router.push('/'); 
};

const handleCheckout = async () => {
  if (!isFormValid.value) {
    donationError.value = 'Mohon pilih nominal donasi dan metode pembayaran.';
    return;
  }
  
  loading.value = true;
  donationError.value = '';

  try {
    // 1. Create Donasi
    const donasiPayload = {
      pengguna_id: donation.value.userId,
      nominal: donation.value.amount,
      frekuensi: donation.value.frequency,
      pesan_dukungan: donation.value.supportMessage, 
    };

    console.log("Mengirim Donasi:", donasiPayload); // Debug
    const donasiResponse = await donasiAPI.create(donasiPayload);
    console.log("Respon Donasi:", donasiResponse); // Debug

    // Ambil ID Donasi (Handle kemungkinan struktur berbeda)
    // Bisa jadi donasiResponse.data.id ATAU donasiResponse.id
    const donasiData = donasiResponse.data || donasiResponse; 
    const donasiId = donasiData.id;

    if (!donasiId) throw new Error("Gagal mendapatkan ID Donasi dari server.");

    // 2. Create Pembayaran
    const pembayaranPayload = {
      pengguna_id: donation.value.userId,
      jenis_transaksi: 'donasi',
      transaksi_id: donasiId,
      metode_bayar: donation.value.paymentMethod,
      jumlah: donation.value.amount,
      nama_lengkap: donation.value.fullName, 
      email: donation.value.email,
      telepon: donation.value.phoneNumber,
    };

    console.log("Mengirim Pembayaran:", pembayaranPayload); // Debug
    const pembayaranResponse = await pembayaranAPI.create(pembayaranPayload);
    console.log("Respon Pembayaran:", pembayaranResponse); // Debug
    
    // Ambil Kode Transaksi (Handle kemungkinan struktur berbeda)
    const pembayaranData = pembayaranResponse.data || pembayaranResponse;
    const kodeTransaksi = pembayaranData.kode_transaksi;
    const metodeBayar = pembayaranData.metode_bayar;

    // Validasi Ketat sebelum Redirect
    if (!kodeTransaksi) {
        console.error("Struktur Respon Aneh:", pembayaranResponse);
        throw new Error("Kode Transaksi tidak ditemukan dalam respon server.");
    }

    console.log(`Redirecting to ${metodeBayar} with code: ${kodeTransaksi}`);

    // 3. Redirect dengan parameter yang SUDAH PASTI ADA
    // 3. Redirect dengan QUERY PARAMETER (agar terbaca oleh halaman checkout)
    if (metodeBayar === 'transfer_bank') {
      router.push({ 
        name: 'BankTransferCheckout', 
        params: { kode_transaksi: kodeTransaksi } // <-- BENAR
      });
    } else if (metodeBayar === 'qris') {
      router.push({ 
        name: 'QrisCheckout', 
        query: { kode_transaksi: kodeTransaksi } // ✅ Ganti params jadi query
      });
    }

  } catch (error) {
    console.error('Checkout error:', error);
    donationError.value = error.message || 'Gagal melanjutkan ke pembayaran.';
  } finally {
    loading.value = false;
  }
};

</script>

<style module>
/* Perhatikan: Jika Anda ingin menghapus styling yang tidak terpakai (misalnya .customInput, .supportMessageInput, dll.), Anda bisa melakukannya di sini. */

/* --- Style Utama (Dibiarkan sama, kecuali penyesuaian yang diperlukan) --- */
.donatePage {
  background-color: #f7f3f0; 
  min-height: 100vh;
  padding: 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.mainContent {
  display: flex;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  min-height: 600px;
}

/* --- Left Side (Image) --- */
.imageSection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fdf6ee;
  padding: 30px;
}

.donationImage {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
}

/* --- Right Side (Form) --- */
.formSection {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 20px;
}

.logoSection {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.logoText {
  font-size: 1.8rem;
  font-weight: 700;
  color: #9e7363;
  margin: 0;
}

.welcomeText {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

/* --- Donation Form Container (penting!) --- */
.donationForm {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 25px; 
  padding-right: 20px; 
  overflow-y: auto; 
}

/* --- Form Elements --- */
.formGroup {
  margin-bottom: 0px; 
}

.sectionTitle {
  font-size: 1.25rem;
  color: #333;
  margin-top: 10px;
  margin-bottom: 15px;
  font-weight: 700;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
}

.sectionLabel {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 10px;
}

.label {
  display: block;
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 8px;
  font-weight: 500;
}

.input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #9e7363;
}

/* --- Amount Options --- */
.amountOptions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px; /* Sesuaikan jika perlu */
}

.amountOption {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
}

.amountOption:hover {
  border-color: #9e7363;
}

.amountOptionActive {
  background-color: #f6c590;
  border-color: #9e7363;
}

.radioCircle {
  width: 14px;
  height: 14px;
  border: 2px solid #ccc;
  border-radius: 50%;
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.amountOptionActive .radioCircle {
  border-color: #9e7363;
  background-color: #9e7363;
}

.amountOptionActive .radioCircle::after {
  content: '';
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.amountText {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}

/* HAPUS/NONAKTIFKAN styling untuk .customInput dan .supportMessageInput yang tidak terpakai */
/*
.customInput { ... }
.supportMessageInput { ... }
*/

/* --- Frequency Options --- */
.frequencyOptions {
  display: flex;
  gap: 15px;
}

.frequencyOption {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
}

.frequencyOption:hover {
  border-color: #9e7363;
}

.frequencyOptionActive {
  background-color: #f6c590;
  border-color: #9e7363;
}

.frequencyOptionActive .radioCircle {
  border-color: #9e7363;
  background-color: #9e7363;
}

.frequencyOptionActive .radioCircle::after {
  content: '';
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.frequencyText {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}

/* --- Payment Options --- */
.paymentOptions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.paymentOption {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
}

.paymentOption:hover {
  border-color: #9e7363;
}

.paymentOptionActive {
  background-color: #f6c590;
  border-color: #9e7363;
}

.paymentOptionActive .radioCircle {
  border-color: #9e7363;
  background-color: #9e7363;
}

.paymentOptionActive .radioCircle::after {
  content: '';
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.paymentText {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
  flex-grow: 1;
}

.paymentIcon {
  height: 24px;
  margin-left: 10px;
}

/* --- Action Buttons --- */
.actionButtons {
  display: flex;
  gap: 16px;
  /* Atur agar tombol selalu di bagian bawah container yang bisa di-scroll */
  margin-top: 30px; 
}

.cancelBtn {
  flex: 1;
  padding: 16px;
  border: 2px solid #9e7363;
  border-radius: 8px;
  background: white;
  color: #9e7363;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancelBtn:hover {
  background: #f8f8f8;
}

.checkoutBtn {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 8px;
  background: #9e7363;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkoutBtn:hover:not(:disabled) {
  background: #8a6252;
}

.checkoutBtnDisabled {
  background: #ccc;
  cursor: not-allowed;
}

.errorText {
  color: red;
  font-weight: 600;
  margin-top: 5px;
  margin-bottom: 0;
}


/* --- Responsive Design --- */
@media (max-width: 992px) {
  .mainContent {
    flex-direction: column;
    min-height: auto;
  }
  
  .imageSection {
    padding: 20px;
    order: -1; 
  }

  .formSection {
    padding: 30px 20px;
  }
  
  .donationForm {
    padding-right: 0;
    gap: 20px;
  }
  
  .actionButtons {
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
  }
}

@media (max-width: 576px) {
  .donatePage {
    padding: 20px 0;
  }
  
  .logoText {
    font-size: 1.5rem;
  }
  
  .amountOption {
    flex-grow: 1;
    justify-content: center;
  }
  
  .frequencyOptions {
    flex-direction: column;
    gap: 10px;
  }
}
</style>