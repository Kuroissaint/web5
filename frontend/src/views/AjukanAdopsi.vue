<template>
<div class="form-wrapper" :style="{ backgroundImage: 'url(' + bg + ')' }">    <div class="form-container">
      <h2 class="judul">Formulir Adopsi</h2>
      <p class="form-description">
        Silakan lengkapi data diri Anda di bawah ini untuk mengajukan adopsi.
        Pastikan data yang diisi valid agar kami dapat memproses pengajuan Anda.
      </p>

      <form class="pengajuan-form" @submit.prevent="kirimForm" enctype="multipart/form-data">
        
        <div class="left-section">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="form.email" placeholder="contoh: email@anda.com" required />

          <label for="nama">Nama Lengkap</label>
          <input type="text" id="nama" v-model="form.namaLengkap" required />

          <label for="umur">Umur</label>
          <input type="number" id="umur" v-model="form.umur" required />

          <label for="nohp">No HP / WhatsApp</label>
          <input type="text" id="nohp" v-model="form.nohp" required />

          <label for="pekerjaan">Pekerjaan</label>
          <input type="text" id="pekerjaan" v-model="form.pekerjaan" required />

          <label>Provinsi</label>
          <select v-model="form.provinsiId" @change="loadKabupaten" required>
            <option value="" disabled selected>Pilih Provinsi</option>
            <option v-for="p in provinsi" :key="p.id" :value="p.id">{{ p.nama_provinsi }}</option>
          </select>

          <label>Kabupaten/Kota</label>
          <select v-model="form.kabupatenKotaId" @change="loadKecamatan" required :disabled="!form.provinsiId">
            <option value="" disabled selected>Pilih Kabupaten/Kota</option>
            <option v-for="k in kabupaten" :key="k.id" :value="k.id">{{ k.nama_kabupaten_kota }}</option>
          </select>

          <label>Kecamatan</label>
          <select v-model="form.kecamatanId" required :disabled="!form.kabupatenKotaId">
            <option value="" disabled selected>Pilih Kecamatan</option>
            <option v-for="k in kecamatan" :key="k.id" :value="k.id">{{ k.nama_kecamatan }}</option>
          </select>

          <label for="alamat">Alamat Lengkap (Jalan, RT/RW)</label>
          <textarea id="alamat" v-model="form.alamat" rows="2" required></textarea>

          <label>Pernah pelihara kucing?</label>
          <div class="radio-group">
            <label><input type="radio" v-model="form.pernahPelihara" value="Ya" required /> Ya</label>
            <label><input type="radio" v-model="form.pernahPelihara" value="Tidak" /> Tidak</label>
          </div>

          <label for="alasan">Alasan ingin mengadopsi</label>
          <textarea id="alasan" v-model="form.alasan" rows="3" placeholder="Tulis alasan Anda..." required></textarea>
        </div>

        <div class="right-section">
          <div class="info-box">
            <p><strong>Informasi Pembayaran</strong></p>
            <p>Silakan transfer biaya adopsi ke salah satu rekening berikut:</p>
            <p style="margin-top: 10px;">
              <strong>BCA:</strong> 123456789 (a.n Meowment)<br />
              <strong>BRI:</strong> 004242568 (a.n Meowment)
            </p>
          </div>

          <label>Metode Pembayaran</label>
          <div class="radio-group" style="flex-direction: column; gap: 10px; margin-bottom: 30px;">
            <label><input type="radio" v-model="form.metodeBayar" value="transfer_bank" required /> Transfer Bank</label>
            <label><input type="radio" v-model="form.metodeBayar" value="e_wallet" /> E-Wallet</label>
          </div>

          <label>Bukti Pembayaran</label>
          <div class="upload-area" @click="$refs.fileInput.click()">
            <div class="icon-upload">📂</div>
            <p v-if="!form.bukti">Klik untuk upload bukti transfer (JPG/PNG)</p>
            <p v-else style="color: #333; font-weight: bold;">{{ form.bukti.name }}</p>
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleFileUpload" 
              accept=".jpg,.png,.jpeg" 
              style="display: none;" 
              required
            />
          </div>
          <div class="commitment-checkbox">
            <label>
              <input type="checkbox" v-model="form.komitmen" required />
              Saya berkomitmen untuk merawat kucing ini dengan penuh tanggung jawab seumur hidupnya.
            </label>
          </div>
        </div>

        <button type="submit" class="btn-kirim" :disabled="isSubmitting">
          {{ isSubmitting ? 'Mengirim...' : 'Kirim Formulir Adopsi' }}
        </button>

      </form>
    </div>
  </div>
</template>

<script>
// URL API Backend
const API_BASE_URL = 'http://localhost:3000/api'; 
import bg from '../assets/background_fix.png'

export default {
  name: "AjukanAdopsi",
  data() {
    return {
      
      provinsi: [],
      kabupaten: [],
      kecamatan: [],
      form: {
        email: "",
        namaLengkap: "", 
        umur: null,
        nohp: "",        
        pekerjaan: "",
        provinsiId: "",
        kabupatenKotaId: "",
        kecamatanId: "",
        alamat: "",
        pernahPelihara: "",
        alasan: "",
        bukti: null,     
        metodeBayar: "", 
        komitmen: false,
      },
      kucingId: this.$route.query.id, 
      penggunaId: 1, // TODO: Ganti dinamis sesuai login
      isSubmitting: false
    };
  },
  
  mounted() {
    this.loadProvinsi();
  },

  methods: {
    async loadProvinsi() {
      try {
        const res = await fetch(`${API_BASE_URL}/wilayah/provinsi`);
        const response = await res.json();
        this.provinsi = response.data; 
      } catch (err) { console.error(err); }
    },

    async loadKabupaten() {
      this.form.kabupatenKotaId = "";
      this.form.kecamatanId = "";
      this.kabupaten = [];
      this.kecamatan = [];
      if (!this.form.provinsiId) return;

      try {
        const res = await fetch(`${API_BASE_URL}/wilayah/kota/${this.form.provinsiId}`);
        const response = await res.json();
        this.kabupaten = response.data;
      } catch (err) { console.error(err); }
    },

    async loadKecamatan() {
      this.form.kecamatanId = "";
      this.kecamatan = [];
      if (!this.form.kabupatenKotaId) return;

      try {
        const res = await fetch(`${API_BASE_URL}/wilayah/kecamatan/${this.form.kabupatenKotaId}`);
        const response = await res.json();
        this.kecamatan = response.data;
      } catch (err) { console.error(err); }
    },

    handleFileUpload(event) {
      this.form.bukti = event.target.files[0];
    },

    async kirimForm() {
      if (!this.form.komitmen) {
          alert('Anda harus berkomitmen untuk merawat kucing ini.');
          return;
      }
      this.isSubmitting = true;

      const formData = new FormData();
      formData.append('penggunaId', this.penggunaId);
      formData.append('kucingId', this.kucingId);
      formData.append('email', this.form.email);
      formData.append('namaLengkap', this.form.namaLengkap);
      formData.append('umur', this.form.umur);
      formData.append('nohp', this.form.nohp);
      formData.append('pekerjaan', this.form.pekerjaan);
      formData.append('provinsi_id', this.form.provinsiId);
      formData.append('kabupaten_kota_id', this.form.kabupatenKotaId);
      formData.append('kecamatan_id', this.form.kecamatanId);
      formData.append('alamat', this.form.alamat);
      formData.append('pernahPelihara', this.form.pernahPelihara);
      formData.append('alasan', this.form.alasan);
      formData.append('metodeBayar', this.form.metodeBayar);
      
      if (this.form.bukti) {
          formData.append('file', this.form.bukti); 
      } else {
           alert('Bukti pembayaran wajib di-upload.');
           this.isSubmitting = false;
           return;
      }
      
      try {
          const response = await fetch(`${API_BASE_URL}/adopsi/submit`, {
              method: 'POST',
              body: formData 
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Gagal mengirim data.');

          alert('Aplikasi Adopsi berhasil dikirim!');
          
          // Redirect Logic yang Benar
          const kodeTransaksi = data.data.kode_transaksi;
          const metode = this.form.metodeBayar;

          if (metode === 'transfer_bank') {
              this.$router.push({ 
                  name: 'BankTransferCheckout', 
                  params: { kode_transaksi: kodeTransaksi } 
              });
          } else {
              this.$router.push({ 
                  path: '/payment', 
                  query: { kode_transaksi: kodeTransaksi } 
              });
          }

      } catch (error) {
          console.error(error);
          alert(`Gagal! ${error.message}`);
      } finally {
          this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
/* RESET */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif; 
}

/* FORM WRAPPER UTAMA (Latar Belakang Krem) */
.form-wrapper {
    min-height: 100vh;
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-size: cover;      /* cover seluruh layar */
    background-position: center; /* tengah */
    background-repeat: no-repeat;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
}

/* FORM CONTAINER BARU (Latar Belakang Putih) */
.form-container {
    max-width: 900px;
    width: 100%;
    /* GANTI BARIS INI: */
    /* background-color: white; */ 
    background-color: rgba(255, 255, 255, 0.85); /* <-- Menjadi semi-transparan */
    
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

/* JUDUL UTAMA */
.judul {
  text-align: center;
  font-size: 2.2rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 10px; 
  color: #7c4f3a; 
}

/* DESKRIPSI FORM */
.form-description {
    text-align: center;
    font-size: 1.1rem;
    color: #555;
    margin-bottom: 30px;
    max-width: 600px;
    line-height: 1.5;
    margin-left: auto;
    margin-right: auto;
}

/* FORM CONTAINER (GRID LAYOUT) */
.pengajuan-form { 
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px; 
  width: 100%; /* Lebar penuh di dalam form-container */
  padding: 0; 
  background-color: transparent;
  border-radius: 0;
  box-shadow: none;
}

/* LABEL */
label {
  display: block;
  margin-top: 15px;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

/* INPUT & TEXTAREA & SELECT */
input[type="text"],
input[type="email"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  font-size: 15px;
  transition: border-color 0.3s;
}

input:focus, select:focus, textarea:focus {
  border-color: #f7961d;
  outline: none;
  box-shadow: 0 0 0 2px rgba(247, 150, 29, 0.2);
}

textarea {
  resize: vertical;
}

/* RADIO GROUP */
.radio-group {
  display: flex;
  gap: 30px;
  margin-top: 5px;
  margin-bottom: 20px;
}
.radio-group label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 0;
  font-weight: 400;
}
.radio-group input[type="radio"] {
  width: auto;
  margin: 0;
}

/* INFO BOX (Rekening) */
.info-box {
    background-color: #f0f0f0; 
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    font-size: 0.95rem;
    color: #555;
}
.info-box p {
    margin-bottom: 5px;
    line-height: 1.4;
}
.info-box strong {
    color: #333;
    font-weight: 600;
}

/* UPLOAD AREA (Bukti Pembayaran) */
.upload-area {
  border: 2px dashed #ccc; 
  background-color: #f7f7f7; 
  border-radius: 15px;
  padding: 30px 20px;
  text-align: center;
  color: #999;
  margin-bottom: 30px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  background-color: #eee;
  border-color: #f7961d;
}

.icon-upload {
  font-size: 3rem; 
  margin-bottom: 10px;
}

.upload-area p {
    font-weight: 500;
}

/* CHECKBOX KOMITMEN */
.commitment-checkbox {
    margin-top: 10px;
    margin-bottom: 20px;
}
.commitment-checkbox label {
    display: inline-flex;
    align-items: flex-start;
    gap: 8px;
    font-weight: 400;
    margin-top: 0;
}
.commitment-checkbox input[type="checkbox"] {
    margin-top: 4px;
    width: auto;
}

/* BUTTON KIRIM */
.btn-kirim {
  grid-column: 1 / span 2; /* Span across both columns */
  background-color: #f7961d; 
  color: white;
  border: none;
  padding: 14px 30px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  justify-self: center;
  font-size: 1.1rem;
  transition: 0.3s;
  min-width: 300px;
  box-shadow: 0 4px 8px rgba(247, 150, 29, 0.3);
}

.btn-kirim:hover:not(:disabled) {
  background-color: #e07b20;
  transform: translateY(-1px);
}

.btn-kirim:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

/* === RESPONSIVE HP & TABLET (max-width: 768px) === */
@media (max-width: 768px) {
  .judul {
        font-size: 1.8rem;
    }
    .form-description {
        font-size: 1rem;
    }
    .form-container {
        padding: 20px;
    }
  .pengajuan-form {
    grid-template-columns: 1fr;
    width: 100%; 
    padding: 0;
    gap: 20px; 
  }
  
  .btn-kirim {
    grid-column: 1 / span 1; 
    min-width: 100%; 
  }
 
  .radio-group {
    flex-wrap: wrap; 
    gap: 15px;
  } 
    .commitment-checkbox label {
        font-size: 0.95rem;
    }
}
</style>