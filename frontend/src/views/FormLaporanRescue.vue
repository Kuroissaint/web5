<template>
  
  <div class="form-page" :style="{ backgroundImage: `url(${bg})` }">
  <div class="form-container">
      <h1>Buat Laporan Baru 🐾</h1>
      <p>Isi data di bawah ini untuk melaporkan penemuan kucing yang membutuhkan bantuan.</p>

      <form @submit.prevent="submitLaporan">
        <div class="form-group">
          <label>Nama Pelapor</label>
          <input v-model="form.nama" type="text" placeholder="Nama kamu" required />
        </div>

        <div class="form-group">
          <label>No. Telepon</label>
          <input v-model="form.telepon" type="text" placeholder="08xxxxxxxxxx" required />
        </div>

        <div class="form-group">
          <label>Waktu Penemuan</label>
          <input v-model="form.waktu" type="datetime-local" required />
        </div>

        <div class="form-group">
          <label>Lokasi Penemuan</label>
          <input v-model="form.lokasi" type="text" placeholder="Contoh: Taman Kota Bandung" required />
        </div>

        <div class="form-group">
          <label>Tag</label>
          <select v-model="form.tag_id" required>
            <option disabled value="">-- Pilih Tag --</option>
                        <option 
                v-for="tag in tags" 
                :key="tag.id" 
                :value="tag.id">
              {{ tag.nama_tag }} 
            </option>
                      </select>
        </div>

        <div class="form-group">
          <label>Deskripsi</label>
          <textarea v-model="form.deskripsi" rows="4" placeholder="Tuliskan kondisi kucing"></textarea>
        </div>

        <div class="form-group">
          <label>Upload Foto</label>
         <input type="file" name="gambar" @change="handleFile" accept="image/*" />
        </div>

        <div class="form-buttons">
          <button type="button" class="btn-cancel" @click="router.push('/rescue')">Kembali</button>
          <button type="submit" class="btn-submit">Kirim</button>
        </div>
      </form>
    </div>

    <div v-if="showPopup" class="popup-overlay">
      <div class="popup-box">
        <h2>Laporan Berhasil Dikirim 🎉</h2>
        <p>Terima kasih, {{ form.nama }}! Laporanmu sedang diproses oleh tim kami.</p>
        <p class="redirect-info">Mengalihkan ke <strong>Laporan Anda</strong>...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue' // ✅ PERUBAHAN: Tambahkan onMounted
import { useRouter } from 'vue-router'
// ✅ PERUBAHAN: Import dataAPI (yang menampung getAllTags)
import api, { dataAPI } from "../services/api" 
import bg from '../assets/background_fix.png'


const router = useRouter()
const showPopup = ref(false)
const userReports = ref([]) 
// ✅ PERUBAHAN: State baru untuk menyimpan Tags
const tags = ref([]);

const form = ref({
  nama: '',
  telepon: '',
  waktu: '',
  lokasi: '',
  tag_id: '',
  deskripsi: '',
  foto: null
})

const handleFile = (e) => {
  form.value.foto = e.target.files[0]
}

// ✅ FUNGSI BARU: Mengambil Tags dari API
const fetchTags = async () => {
    try {
        const res = await dataAPI.getAllTags(); // Asumsi: fungsi ini ada di api.js
        // ✅ PASTIKAN: Data array tags Anda berada di res.data.data
        // Sesuaikan jika hanya di res.data: tags.value = res.data || [];
        tags.value = res.data || []; 

    } catch (error) {
        console.error("Gagal memuat tags:", error);
    }
};

const submitLaporan = async () => {
  let errorMessage = "Gagal mengirim laporan rescue";
  try {
    showPopup.value = true
    const formData = new FormData()
    const deviceId = localStorage.getItem("device_id")
    formData.append("device_id", deviceId)
    formData.append("nama_pelapor", form.value.nama)
    formData.append("telepon", form.value.telepon)
    formData.append("lokasi_penemuan", form.value.lokasi)
    formData.append("deskripsi", form.value.deskripsi)
    formData.append("tag_id", form.value.tag_id)
    formData.append("waktu_penemuan", form.value.waktu || new Date().toISOString())
    formData.append("kucing_id", 0)
    if (form.value.foto) formData.append("gambar", form.value.foto)

    // CATATAN: Karena Anda menggunakan api.post, dan di api.js post tidak otomatis menghapus Content-Type header, 
    // jika post Anda adalah Axios-like, ini mungkin berfungsi, tetapi jika itu wrapper fetchAPI custom, 
    // Anda harus menghapus headers ini (tapi karena Anda bilang tidak mau mengubah yang sudah benar, kita biarkan dulu).
    // PERINGATAN: Headers di bawah ini sering menyebabkan FormData gagal di API custom fetch.
    const response = await api.post("/rescue", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    
    const responseData = response.data || response;

    if (responseData && responseData.success) {
      
      const stored = JSON.parse(localStorage.getItem("myRescueReports")) || []
      stored.push(responseData.id)
      localStorage.setItem("myRescueReports", JSON.stringify(stored))

      const newReport = {
        id: responseData.id,
        nama_pelapor: form.value.nama,
        telepon: form.value.telepon,
        waktu_penemuan: form.value.waktu || new Date().toISOString(),
        lokasi_penemuan: form.value.lokasi,
        deskripsi: form.value.deskripsi,
        status_display: 'Sedang Diproses',
        // Kosongkan tags, karena detail tags baru bisa diambil dari API
        tags: '',           
        url_gambar_utama: form.value.foto ? URL.createObjectURL(form.value.foto) : null
      }

      const exists = userReports.value.find(r => r.id === newReport.id)
      if (!exists) userReports.value.push(newReport)
      
      console.log("ID rescue baru:", responseData.id)

      setTimeout(() => {
        showPopup.value = false
        router.push('/rescue') 
      }, 1000)
      
    } else {
      errorMessage = responseData.message || "Laporan gagal dikirim karena kesalahan server.";
      throw new Error(errorMessage);
    }

  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || errorMessage;
    console.error("Gagal submit rescue:", error)
    alert(errorMsg)
    showPopup.value = false
  }
}

// ✅ PERUBAHAN: Panggil fetchTags saat komponen dimuat
onMounted(() => {
    fetchTags();
});
</script>


  <style scoped>
.form-page {
  min-height: 100vh;
  background-size: cover;      /* cover seluruh layar */
  background-position: center; /* tengah */
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.form-container {
  width: 90%; /* fleksibel di mobile */
  background-color: rgba(255, 255, 255, 0.85); /* semi-transparan supaya form terbaca */
  padding: 2rem;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

@media (max-width: 480px) {
  .form-container {
    padding: 1rem;
  }

  .form-buttons {
    flex-direction: column;
    gap: 0.8rem;
  }

  .btn-submit, .btn-cancel {
    width: 100%;
  }
}

  
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  h1 {
    text-align: center;
    color: #9E7363;
    margin-bottom: 0.5rem;
  }
  
  p {
    text-align: center;
    color: #444;
    margin-bottom: 2rem;
    font-size: 0.95rem;
  }
  
  .form-group {
    margin-bottom: 1.2rem;
    display: flex;
    flex-direction: column;
  }
  
  label {
    font-weight: 600;
    color: #3c2a21;
    margin-bottom: 0.4rem;
  }
  
  input, textarea, select {
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 0.7rem 0.9rem;
    font-size: 1rem;
    font-family: 'Poppins', sans-serif;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  
  input:focus, textarea:focus, select:focus {
    border-color: #9E7363;
    box-shadow: 0 0 6px rgba(158,115,99,0.3);
  }
  
  .form-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 1.8rem;
  }
  
  .btn-submit {
    background-color: #9E7363;
    color: white;
    border: none;
    padding: 0.7rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
  }
  
  .btn-submit:hover {
    background-color: #5a372c;
  }
  
  .btn-cancel {
    background-color: #ccc;
    color: #333;
    border: none;
    padding: 0.7rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .btn-cancel:hover {
    background-color: #999;
  }
  
  /* Popup sukses */
  .popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s;
  }
  
  .popup-box {
    background: #fff;
    padding: 2rem 2.5rem;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    text-align: center;
    max-width: 400px;
    animation: slideUp 0.4s ease-out;
  }
  
  .popup-box h2 {
    color: #9E7363;
    margin-bottom: 0.5rem;
  }
  
  .popup-box p {
    color: #555;
  }
  
  .redirect-info {
    font-size: 0.9rem;
    color: #888;
    margin-top: 1rem;
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }
  </style>