<template>
<div class="form-wrapper" :style="{ backgroundImage: 'url(' + bg + ')' }">    
    <div class="form-container"> 
      
      <form class="pengajuan-form" @submit.prevent="kirimForm">
        <h2 class="judul-form">Formulir Pengajuan Kucing Untuk Adopsi</h2>
        <p class="keterangan-form">Isi data di bawah ini dengan lengkap dan benar untuk pengajuan adopsi.</p>

        <div class="kolom">
          <h3 class="judul-bagian-baru">Data Pemilik atau Pengaju</h3>

          <label>Nama Lengkap</label>
          <input type="text" v-model="form.namaPemilik" required />

          <label>No HP/WA</label>
          <input type="text" v-model="form.nohp" required />

          <label>Alamat</label>
          <input type="text" v-model="form.alamat" required />
          
          <label>Lokasi (Provinsi)</label>
          <select v-model="form.provinsiId" @change="loadKabupaten" required>
            <option value="" disabled selected>Pilih Provinsi</option>
            <option v-for="prov in provinsi" :key="prov.id" :value="prov.id">
              {{ prov.nama_provinsi }}
            </option>
          </select>

          <label>Lokasi (Kabupaten/Kota)</label>
          <select v-model="form.kabupatenKotaId" @change="loadKecamatan" required :disabled="!form.provinsiId">
            <option value="" disabled selected>Pilih Kabupaten/Kota</option>
            <option v-for="kab in kabupaten" :key="kab.id" :value="kab.id">
              {{ kab.nama_kabupaten_kota }}
            </option>
          </select>

          <label>Lokasi (Kecamatan)</label>
          <select v-model="form.kecamatanId" required :disabled="!form.kabupatenKotaId">
            <option value="" disabled selected>Pilih Kecamatan</option>
            <option v-for="kec in kecamatan" :key="kec.id" :value="kec.id">
              {{ kec.nama_kecamatan }}
            </option>
          </select>

        </div>

        <div class="kolom">
          <h3 class="judul-bagian-baru">Data Kucing</h3>

          <div class="upload-area" @click="uploadFoto">
            <span class="icon-upload">&#x1F4F8;</span> 
            
            <p>{{ form.foto ? form.foto.name : 'Upload Foto Kucing' }}</p>
            
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleFileUpload" 
              accept="image/jpeg,image/png" 
              hidden 
              required
            />
          </div>

          <label>Nama Kucing</label>
          <input type="text" v-model="form.namaKucing" required />

          <label>Usia</label>
          <input type="text" v-model="form.usia" required /> 

          <label>Warna Bulu</label>
          <input type="text" v-model="form.warnaBulu" required /> 

          <label>Jenis Kelamin</label>
          <div class="radio-group">
            <label><input type="radio" v-model="form.jenisKelamin" value="Jantan" required /> Jantan</label>
            <label><input type="radio" v-model="form.jenisKelamin" value="Betina" required /> Betina</label>
          </div>

          <label>Sudah Steril?</label>
          <div class="radio-group">
            <label><input type="radio" v-model="form.sudahSteril" value="1" required /> Ya</label>
            <label><input type="radio" v-model="form.sudahSteril" value="0" required /> Tidak</label>
          </div>

          <label>Biaya Adopsi (Rp)</label>
          <input type="number" v-model.number="form.biayaAdopsi" required min="0" />

          <label>Deskripsi Kucing</label>
          <textarea
            v-model="form.deskripsi"
            placeholder="deskripsikan kucing"
            rows="4"
            required
          ></textarea>
        </div>
        
        <div class="feedback-area">
            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
            <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        </div>

        <button type="submit" class="btn-kirim" :disabled="isSubmitting">
          {{ isSubmitting ? 'Memproses...' : 'Kirim Pengajuan' }}
        </button>
      </form>
      
    </div> </div>
</template>

<script>
import bg from '../assets/background_fix.png'

export default {
  data() {
    return {
      
      // ✅ Ganti 'provinces' jadi 'provinsi' agar konsisten dengan v-for di HTML
      provinsi: [], 
      kabupaten: [],
      kecamatan: [],

      form: {
        namaKucing: "",
        jenisKelamin: "Jantan",
        warnaBulu: "",
        usia: "",
        sudahSteril: 0,
        deskripsi: "",
        foto: null,

        namaPemilik: "",
        nohp: "",
        alamat: "",

        provinsiId: "",
        kabupatenKotaId: "",
        kecamatanId: "",
        biayaAdopsi: 0,
      },

      isSubmitting: false,
      errorMessage: null,
      successMessage: null,
    };
  },

  mounted() {
    // ✅ PERBAIKAN DISINI: Panggil method dengan nama yang benar
    this.loadProvinsi(); 
  },

  methods: {
    // =======================
    // LOAD DATA LOKASI
    // =======================

    async loadProvinsi() {
      try {
        const res = await fetch("http://localhost:3000/api/wilayah/provinsi");
        if (!res.ok) throw new Error('Gagal mengambil data provinsi');
        
        const response = await res.json();
        // ✅ Ambil .data dari respon JSON backend
        this.provinsi = response.data; 
      } catch (err) {
        console.error("Gagal fetch provinsi:", err);
      }
    },

    async loadKabupaten() {
      this.form.kabupatenKotaId = "";
      this.form.kecamatanId = "";
      this.kabupaten = [];
      this.kecamatan = [];

      if (!this.form.provinsiId) return;

      try {
        // ✅ Pakai endpoint 'kota' sesuai backend
        const res = await fetch(
          `http://localhost:3000/api/wilayah/kota/${this.form.provinsiId}`
        );
        if (!res.ok) throw new Error('Gagal mengambil data kabupaten');
        
        const response = await res.json();
        this.kabupaten = response.data;
      } catch (err) {
        console.error("Gagal fetch kabupaten:", err);
      }
    },

    async loadKecamatan() {
      this.form.kecamatanId = "";
      this.kecamatan = [];

      if (!this.form.kabupatenKotaId) return;

      try {
        const res = await fetch(
          `http://localhost:3000/api/wilayah/kecamatan/${this.form.kabupatenKotaId}`
        );
        if (!res.ok) throw new Error('Gagal mengambil data kecamatan');
        
        const response = await res.json();
        this.kecamatan = response.data;
      } catch (err) {
        console.error("Gagal fetch kecamatan:", err);
      }
    },

    // =======================
    // FILE UPLOAD
    // =======================

    handleFileUpload(event) {
      this.form.foto = event.target.files[0];
    },

    uploadFoto() {
      this.$refs.fileInput.click();
    },

    // =======================
    // KIRIM FORM
    // =======================

    async kirimForm() {
      this.errorMessage = null;
      this.successMessage = null;

      if (!this.form.foto) {
        alert("Mohon upload foto kucing.");
        return;
      }

      this.isSubmitting = true;

      const formData = new FormData();
      // TODO: Ganti dengan ID pengguna yang login dinamis jika sudah ada auth
      formData.append("pengguna_id", 1); 

      // Data kucing
      formData.append("namaKucing", this.form.namaKucing);
      formData.append("jenisKelamin", this.form.jenisKelamin.toLowerCase());
      formData.append("warnaBulu", this.form.warnaBulu);
      formData.append("usia", this.form.usia);
      formData.append("sudahSteril", this.form.sudahSteril);
      formData.append("deskripsi", this.form.deskripsi);
      formData.append('biayaAdopsi', this.form.biayaAdopsi);

      // Data pemilik
      formData.append("nama_lengkap", this.form.namaPemilik);
      formData.append("telepon", this.form.nohp);
      formData.append("alamat_lengkap", this.form.alamat);

      // Lokasi
      formData.append("provinsi_id", this.form.provinsiId);
      formData.append("kabupaten_kota_id", this.form.kabupatenKotaId);
      formData.append("kecamatan_id", this.form.kecamatanId);

      // File
      formData.append("foto", this.form.foto);

      try {
        // Gunakan endpoint pengajuan yang sudah diperbaiki di backend
        const response = await fetch("http://localhost:3000/api/pengajuan", { 
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal mengajukan kucing.");
        }

        this.successMessage = "Pengajuan berhasil dikirim!";
        
        // Reset form setelah sukses (opsional)
        setTimeout(() => {
           this.$router.push({ name: 'AdoptPage' }); // Redirect ke halaman adopsi
        }, 2000);

      } catch (err) {
        this.errorMessage = "Pengajuan gagal: " + err.message;
        console.error(err);
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
  font-family: "Poppins", sans-serif;
}

/* FORM WRAPPER - Latar Belakang Penuh */
.form-wrapper {
  min-height: 100vh;
  background-size: cover;      /* cover seluruh layar */
  background-position: center; /* tengah */
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem; /* Tambahkan padding agar tidak mentok di HP */
}

/* FORM CONTAINER - Kotak Putih Semi-Transparan (Menyesuaikan dengan FormLaporanRescue) */
.form-container {
  width: 90%; 
  background-color: rgba(255, 255, 255, 0.85); /* semi-transparan */
  padding: 40px; /* Padding di sini */
  border-radius: 20px;
  max-width: 900px; /* Max width seperti yang lama */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); /* Shadow lebih kuat */
}
.pengajuan-form { 
  /* Cukup pertahankan Grid */
  margin: 0; /* Hapus margin yang lama */
  max-width: none;
  background-color: transparent; 
  padding: 0; 
  border-radius: 0;
  box-shadow: none;
  
  /* Atur sebagai grid 2 kolom + 1 baris untuk header */
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px; 
}

/* JUDUL UTAMA (Formulir Pengajuan Kucing Untuk Adopsi) - Di dalam Kotak */
.judul-form {
  text-align: center;
  font-size: 26px;
  font-weight: bold;
  margin-top: 0; /* Hapus margin atas */
  margin-bottom: 5px; 
  color: #7c4f3a; /* Warna cokelat/ungu */
  grid-column: 1 / span 2; /* Mencakup kedua kolom */
}

/* KETERANGAN (Isi data di bawah ini...) - Di dalam Kotak */
.keterangan-form {
  text-align: center;
  font-size: 15px;
  color: #555;
  
  margin-bottom: 30px;
  grid-column: 1 / span 2; /* Mencakup kedua kolom */
}

/* KOLOM - Hilangkan padding yang terlalu banyak */
.kolom {
  padding: 0; 
}

/* JUDUL BAGIAN (Data Pemilik, Data Kucing) - Teks Biasa */
.judul-bagian-baru {
  font-size: 16px;
  font-weight: 600;
  color: #333; 
  margin-bottom: 20px;
  margin-top: 15px; 
  text-transform: uppercase;
  border-bottom: 1px solid #eee; 
  padding-bottom: 5px;
}


/* LABEL */
label {
  display: block;
  margin-top: 15px;
  margin-bottom: 5px;
  font-weight: 500;
  color: #444;
}

/* INPUT & TEXTAREA */
input[type="text"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px; 
  border: 1px solid #ddd;
  margin-bottom: 10px; 
  background-color: white;
  font-size: 14px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); 
}
input::placeholder {
  color: #aaa;
}

/* RADIO GROUP */
.radio-group {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}
.radio-group label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 0;
}
.radio-group input[type="radio"] {
  width: auto;
  margin: 0;
}

/* UPLOAD AREA - Buat lebih minimalis */
.upload-area {
  
  width: 150px; 
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: #f7f7f7; 
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  color: #999;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px dashed #ccc; 
}

.upload-area:hover {
  background-color: #eee;
}

.icon-upload {
  font-size: 30px;
  margin-bottom: 5px;
}

/* BUTTON */
.btn-kirim {
  grid-column: 1 / span 2;
  background-color: #b38b91;
  color: white;
  border: none;
  padding: 14px 30px;
  border-radius: 8px; 
  font-weight: bold;
  cursor: pointer;
  justify-self: center;
  font-size: 18px;
  transition: 0.3s;
  min-width: 300px;
  margin-top: 20px; /* Tambah jarak atas tombol */
}

.btn-kirim:hover:not(:disabled) {
  background-color: #a46e7a;
}

.btn-kirim:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* FEEDBACK STYLES */
.feedback-area {
  grid-column: 1 / span 2;
  text-align: center;
  margin-top: 10px;
}

.success-message, .error-message {
  padding: 12px;
  border-radius: 5px;
  font-weight: 500;
  margin-bottom: 15px;
  font-size: 15px;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* === RESPONSIVE HP & TABLET (max-width: 768px) === */
@media (max-width: 768px) {
  .pengajuan-form {
   grid-template-columns: 1fr;
   max-width: none; 
   width: 95%; 
   padding: 20px; 
   gap: 20px; 
  }
  
  .judul-form, .keterangan-form, .btn-kirim, .feedback-area {
    grid-column: 1 / span 1; /* Di mobile, semuanya hanya 1 kolom */
  }

  .btn-kirim {
   width: 100%; 
   min-width: 100%;
  }
  
  .radio-group {
   flex-wrap: wrap; 
   gap: 15px;
  } 
}
</style>