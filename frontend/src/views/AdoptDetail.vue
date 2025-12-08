<template>
  <section class="detail-container" v-if="cat">
    <h2>Adopsi Kucing</h2>

    <div class="detail-content">
      
      <div class="cat-photo">
          <button 
              class="nav-btn prev" 
              @click="prevImage" 
              v-if="cat.galeri && cat.galeri.length > 1"
          >
              &#10094;
          </button>
          
          <img :src="cat.galeri[currentImageIndex]" :alt="cat.nama" />
          
          <button 
              class="nav-btn next" 
              @click="nextImage" 
              v-if="cat.galeri && cat.galeri.length > 1"
          >
              &#10095;
          </button>

          <div class="dots-indicator" v-if="cat.galeri && cat.galeri.length > 1">
              <span 
                  v-for="(img, index) in cat.galeri" 
                  :key="index"
                  :class="{ active: index === currentImageIndex }"
                  @click="selectImage(index)"
              ></span>
          </div>
      </div>
      <div class="cat-info">
        <h3>{{ cat.nama }}</h3>
        
        <p>Warna: {{ cat.warnaBulu }}</p>
        <p>Jenis kelamin: {{ cat.jenisKelamin }}</p>
        <p>Alamat: {{ cat.alamatLengkap }}</p>
        <p>{{ cat.sudahSteril ? 'Sudah disteril' : 'Belum disteril' }}</p>

        <h4 class="price">Biaya Adopsi: {{ formatRupiah(cat.biayaAdopsi) }}</h4>
        
       <button class="ajukanadopt-btn" @click="ajukanAdopsi"> Ajukan adopsi
</button>

      </div>
    </div>

    <div class="desc">
      <h3>Deskripsi</h3>
      <p><em>{{ cat.deskripsi }}</em></p>
    </div>

  </section>
</template>
<script>


export default {
  data() {
      return {
          cat: null, 
          currentImageIndex: 0,
      };
  },
  created() {

      const query = this.$route.query;

      // Membentuk objek cat dari data yang diterima
      this.cat = {
          id:  query.id,
          nama: query.nama, 
          umur: query.umur,
          jenisKelamin: query.jenisKelamin,
          warnaBulu: query.warnaBulu,
          alamatLengkap: query.alamatLengkap,
          deskripsi: query.deskripsi,
          biayaAdopsi: query.biaya, // ✅ Menggunakan key 'biaya' dari AdoptPage.vue
          galeri: JSON.parse(query.galeri || '[]')
      };
  },
  methods: {
      formatRupiah(angka) {
          if (!angka) return 'Rp0,00'; 
          return new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2
          }).format(angka);
      },
  

    
      // Fungsi untuk menavigasi ke formulir adopsi
      ajukanAdopsi() {
          this.$router.push({
              name: 'AjukanAdopsi',
              query: {
                id: this.cat.id,
                // Kirim data yang dibutuhkan AjukanAdopsi.vue
                biayaAdopsi: this.cat.biayaAdopsi, // ✅ Key yang dikirim di sini sudah benar
              }
          });
      },
      // ... (prevImage, nextImage, selectImage tetap sama)
  }
}

</script>
  
  <style scoped>
  .detail-container {
    background-color: #f7c58c;
    padding: 40px 60px;
  }
  
  /* Tata letak DESKTOP: Foto dan Info Samping-menyamping */
  .detail-content {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 120px; 
    margin-top: 20px;
  }
  
  /* --- CAROUSEL/FOTO (Desktop) --- */
  .cat-photo {
    position: relative;
    width: 320px; 
    height: 350px;
    border-radius: 20px;
    background-color: #7c5143;
    padding: 10px;
    overflow: hidden; 
  }
  
  .cat-photo img {
    width: 100%;
    height: 100%;
    border-radius: 15px; 
    object-fit: cover; 
    transition: opacity 0.3s ease; 
  }
  
  /* Tombol Navigasi */
  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 10px 12px;
    cursor: pointer;
    z-index: 10;
    border-radius: 50%;
    font-size: 18px;
    line-height: 1;
  }
  
  .nav-btn.prev { left: 15px; }
  .nav-btn.next { right: 15px; }
  
  /* Indikator Dots */
  .dots-indicator {
      position: absolute;
      bottom: 15px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 10;
  }
  
  .dots-indicator span {
      display: block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      transition: background-color 0.3s, transform 0.2s;
  }
  
  .dots-indicator span.active {
      background-color: #f7961d;
      transform: scale(1.2);
  }
  
  /* --- INFO KUCING --- */
  .cat-info {
    max-width: 400px;
  }
  
  .price {
    margin-top: 15px;
    color: white;
    background-color: #f7961d;
    padding: 8px 12px;
    border-radius: 6px;
    display: inline-block;
  }
  
  .ajukanadopt-btn {
    display: block;
    width: fit-content;
    margin-top: 15px;
    padding: 20px 30px;
    background-color: #ccc;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
  }
  .ajukanadopt-btn:hover{
    background-color: #a56c54;
    color: white;
  }
  
  /* --- DESKRIPSI --- */
  .desc {
    margin: 40px 0; 
    max-width: 800px;
  }
  
  
  /* ================================================= */
  /* MEDIA QUERY UNTUK TABLET & SMARTPHONE (max-width: 992px) */
  /* ================================================= */
  @media (max-width: 992px) {
      /* Padding Container */
      .detail-container {
          padding: 20px 30px;
      }
      
      /* Mengubah tata letak detail-content menjadi satu kolom (bertumpuk) */
      .detail-content {
          flex-direction: column;
          align-items: center; 
          gap: 30px; 
      }
  
      /* Ukuran gambar kucing diperkecil di ponsel */
      .cat-photo {
          width: 100%; 
          max-width: 350px;
          height: 350px;
      }
      
      .cat-photo img {
          object-fit: contain;
      }
  
      .cat-info {
          max-width: 100%; 
          text-align: center;
      }
      
      .price {
          display: block;
          margin-left: auto;
          margin-right: auto;
          max-width: fit-content;
      }
  
      .desc {
          margin: 30px 0; 
          text-align: left;
      }
  }
  </style>