<template>
  <section class="adopt-header">
    <div class="search-container">
      <input 
        type="text" 
        placeholder="Search lokasi" v-model="pencarian" 
        class="search-input"
      />
    </div>
    
    <button class="ajukan-btn" @click="$router.push({ name: 'AjukanKucing' })">
      Ajukan kucing untuk adopsi
    </button>
  </section>

  <main class="adopt-container">
    <h2>Adopsi Kucing</h2>
    <div class="cat-grid">
      <div
        v-for="kucing in filteredCats"
        :key="kucing.nama"
        class="cat-card"
      >
        <div class="card-image">
          <img :src="kucing.galeri[0]" :alt="kucing.nama" />
        </div>

        <div class="card-details">
          <h4>{{ kucing.nama }}</h4>
          <p><strong>Usia</strong> : {{ kucing.umur }} bulan</p>
          <p><strong>Lokasi</strong> : {{ kucing.kota }}</p>
        </div>

        <button class="btn-selengkapnya" @click="lihatDetail(kucing)">
          Lihat detail
        </button>
      </div>
    </div>
  </main>
</template>
<script>
export default {
  data() {
      return {
          pencarian: '',
          kucingList: [], 
          isLoading: false,
      };
  },
  computed: {
      filteredCats() {
          if (!this.pencarian) {
              return this.kucingList;
          }
          const term = this.pencarian.toLowerCase();
          return this.kucingList.filter(kucing =>
              kucing.kota.toLowerCase().includes(term) ||
              kucing.nama.toLowerCase().includes(term)
          );
      }
  },
  created() {
      this.fetchKucingList(); 
  },
  methods: {
      async fetchKucingList() {
          this.isLoading = true;
          try {
              const response = await fetch('http://localhost:3000/api/kucing'); 
              
              const responseData = await response.json(); // Ambil seluruh objek respons
              
              // 1. Cek status respons (Termasuk jika server mengembalikan 200 tapi dengan data error)
              if (!response.ok || responseData.success === false) {
                  throw new Error(responseData.message || 'Gagal mengambil data dari server');
              }

              // 2. 🛑 PERBAIKAN KRITIS: Ambil array kucing dari properti 'data'
              const listKucing = responseData.data; 

              // 3. Verifikasi apakah listKucing adalah array
              if (!Array.isArray(listKucing)) {
                   throw new Error('Format data kucing yang diterima salah (bukan array).');
              }
              
              // 4. Proses mapping (Sekarang `.map` dipanggil pada array listKucing)
              this.kucingList = listKucing.map(k => {
                  const parts = [k.nama_kecamatan, k.nama_kabupaten_kota, k.nama_provinsi].filter(Boolean);
                  const locationString = parts.join(', ');

                  // Asumsi: KucingModel mengembalikan 'url_gambar' sebagai path relatif /uploads/...
                  const imageUrl = k.url_gambar ? `http://localhost:3000${k.url_gambar}` : 'placeholder.jpg';
                  
                  // Pastikan steril adalah boolean (jika di DB disimpan sebagai 1/0)
                  const isSteril = k.sudah_steril === 1 || k.sudah_steril === true;

                  return {
                      id: k.id,
                      nama: k.nama_kucing,
                      jenisKelamin: k.jenis_kelamin,
                      warnaBulu: k.warna_bulu,
                      deskripsi: k.deskripsi,
                      alamatLengkap: k.alamat_lengkap,
                      biayaAdopsi: k.biaya_adopsi,
                      umur: k.umur,
                      sudahSteril: isSteril,
                      
                      kota: locationString || "Tidak ada lokasi",
                      
                      // Menggunakan array gambar (dengan URL lengkap)
                      galeri: [imageUrl], 
                  }
              });

          } catch (error) {
              console.error('Error saat mengambil daftar kucing:', error);
              alert('Gagal mengambil data kucing: ' + error.message);
          } finally {
              this.isLoading = false;
          }
      },
      // Fungsi ini mengirimkan data kucing yang sudah di-fetch ke AdoptDetail.vue
      lihatDetail(kucing) {
          this.$router.push({ 
              name: 'AdoptDetail',
              query: { 
                  id: kucing.id,
                  nama: kucing.nama,
                  umur: kucing.umur,
                  warnaBulu: kucing.warnaBulu,
                  jenisKelamin: kucing.jenisKelamin,
                  deskripsi: kucing.deskripsi,
                  alamatLengkap: kucing.alamatLengkap,
                  biaya: kucing.biayaAdopsi, 
                  galeri: JSON.stringify(kucing.galeri), 
              }
          });
      },
  }
}
</script>
  
<style scoped>
/* CSS TIDAK BERUBAH (tetap sama seperti yang Anda punya) */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Poppins", sans-serif;
}

body {
  background-color: #f7c58f;
}

.adopt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 60px;
  background-color: #f7c58f;
  gap: 20px;
}

.search-container {
  flex: 1;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 15px 20px;
  border-radius: 25px;
  border: 2px solid #ddd;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  border-color: #f7961d;
  box-shadow: 0 0 8px rgba(247, 150, 29, 0.3);
}

.ajukan-btn {
  background-color: #f7961d;
  border: none;
  padding: 15px 25px;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.ajukan-btn:hover {
  background-color: #e58a12;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

/* GRID KUCING */
.adopt-container {
  padding: 20px 60px;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  margin-top: 20px;
}

/* CARD BARU - KONSISTEN DENGAN PAGE LAIN */
.cat-card {
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.25s, box-shadow 0.25s;
  display: flex;
  flex-direction: column;
  padding: 15px;
}

.cat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}

/* GAMBAR SEPERTI CARD LAIN */
.card-image {
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 10px;
  margin-bottom: 15px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* DETAIL SEPERTI CARD LAIN */
.card-details {
  padding: 0 10px;
  color: var(--dark);
  font-size: 0.95rem;
  line-height: 1.5;
  flex-grow: 1;
  margin-bottom: 15px;
}

.card-details h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.card-details p {
  margin-bottom: 8px;
  color: #444;
}

/* BUTTON SEPERTI CARD LAIN */
.btn-selengkapnya {
  display: block;
  text-align: center;
  padding: 12px;
  color: white;
  font-weight: 600;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 0.95rem;
  background-color: #f7961d; /* Warna Primary */
}

.btn-selengkapnya:hover {
  background-color: #e07b20;
}

/* MEDIA QUERY UNTUK TABLET (Layar sampai 1024px) */
@media (max-width: 1024px) {
  .cat-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .adopt-container, .adopt-header {
    padding: 20px 30px;
  }
  
  .adopt-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .search-container {
    max-width: 100%;
  }
  
  .ajukan-btn {
    width: 100%;
    text-align: center;
  }
}

/* MEDIA QUERY UNTUK SMARTPHONE (Layar sampai 600px) */
@media (max-width: 600px) {
  .cat-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  
  .adopt-header {
    padding: 15px 20px;
  }
}
</style>