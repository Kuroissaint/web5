const KucingModel = require('../models/KucingModel');
const fs = require('fs');
const path = require('path');

class KucingController {
  constructor(db) {
    this.kucingModel = new KucingModel(db);
  }

  // ... (Method getAllKucing, getKucingById, searchKucing, getTags SAMA SEPERTI SEBELUMNYA - Tidak perlu diubah)

  async getAllKucing(request, reply) {
    try {
      const kucing = await this.kucingModel.findAll();
      
      return reply.send({ success: true, data: kucing });
    } catch (error) {
      return reply.status(500).send({ success: false, error: 'Gagal mendapatkan data kucing' });
    }
  }

  async getKucingById(request, reply) {
    try {
      const { id } = request.params;
      const kucing = await this.kucingModel.getById(id);
      if (!kucing) return reply.status(404).send({ success: false, error: 'Kucing tidak ditemukan' });
      
      return reply.send({ success: true, data: kucing });
    } catch (error) {
      return reply.status(500).send({ success: false, error: 'Gagal detail: ' + error.message });
    }
  }

  async searchKucing(request, reply) {
    try {
      const { q, jenis, lokasi, status, ids } = request.query; // Tambah ids
      const kucing = await this.kucingModel.searchKucing({ keyword: q, jenis, lokasi, status, ids });
      return reply.send({ success: true, data: kucing });
    } catch (error) {
      return reply.status(500).send({ success: false, error: 'Gagal mencari: ' + error.message });
    }
  }

  async getTags(request, reply) {
    try {
      const tags = await this.kucingModel.getAllTags();
      return reply.send({ success: true, data: tags });
    } catch (error) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  }

  // ✅ PERBAIKAN UTAMA DI SINI
  async createKucing(request, reply) {
    try {
      const parts = request.body;
      
      // --- HELPER: Ambil value dengan aman (Anti-Null/Undefined) ---
      const getValue = (field) => {
        if (!field) return null;
        // Jika field adalah array (terkirim double), ambil yang pertama
        if (Array.isArray(field)) {
            const first = field[0];
            return first && first.value !== undefined ? first.value : first;
        }
        // Jika object dari multipart (punya properti .value)
        if (typeof field === 'object' && field.value !== undefined) return field.value;
        // Jika string biasa
        return field;
      };

      // 1. HANDLING FOTO (Logika tetap sama)
      let uploadedFilenames = [];
      if (parts.foto) {
        const files = Array.isArray(parts.foto) ? parts.foto : [parts.foto];
        for (const file of files) {
          const filename = `${Date.now()}-${Math.floor(Math.random() * 1000)}-${file.filename}`;
          const savePath = path.join(__dirname, '../../uploads', filename);
          if (!fs.existsSync(path.dirname(savePath))) fs.mkdirSync(path.dirname(savePath), { recursive: true });
          fs.writeFileSync(savePath, file._buf);
          uploadedFilenames.push(filename);
        }
      }

      // 2. Tentukan field mana yang digunakan (Rescue vs Lost)
      // Kita anggap form ini adalah Rescue jika tidak ada 'nama_kucing' tapi ada 'nama' pelapor.
      const isRescue = !getValue(parts.nama_kucing) && getValue(parts.nama);
      
      // 3. HANDLING TAGS (handle 'tags' plural untuk Lost dan 'tag' singular untuk Rescue)
      let tagsData = [];
      if (parts.tags) { // Lost Form menggunakan 'tags'
        const rawTags = Array.isArray(parts.tags) ? parts.tags : [parts.tags];
        tagsData = rawTags.map(t => getValue(t));
      } else if (parts.tag) { // Rescue Form menggunakan 'tag'
          const rawTags = Array.isArray(parts.tag) ? parts.tag : [parts.tag];
          tagsData = rawTags.map(t => getValue(t));
      }

      // 4. SUSUN DATA (Gunakan getValue + penyesuaian untuk kedua form)
      const cleanData = {
        // Nama Pelapor: Ambil dari nama_pelapor (Lost) atau nama (Rescue)
        nama_pelapor: getValue(parts.nama_pelapor) || getValue(parts.nama), 
        
        telepon: getValue(parts.telepon),
        
        // Waktu Hilang: Ambil dari waktu_hilang (Lost) atau waktu (Rescue)
        waktu_hilang: getValue(parts.waktu_hilang) || getValue(parts.waktu),
        
        lokasi: getValue(parts.lokasi),
        
        // Wilayah (hanya ada di Lost Form)
        provinsi_id: getValue(parts.provinsi_id) || null,
        kabupaten_kota_id: getValue(parts.kabupaten_kota_id) || null,
        kecamatan_id: getValue(parts.kecamatan_id) || null,
        
        // ✅ SOLUSI ERROR 'nama_kucing' cannot be null: Berikan default kuat
        nama_kucing: getValue(parts.nama_kucing) || (isRescue ? 'Kucing Rescue' : 'Kucing Hilang'),
        
        deskripsi: getValue(parts.deskripsi),
        
        // Ras: Berikan default 'Kampung' jika Rescue (jika form tidak mengirimkannya)
        ras: getValue(parts.ras) || (isRescue ? 'Kampung' : null), 
        
        fotos: uploadedFilenames,
        tags: tagsData,
        
        // ✅ Set status otomatis
        status: isRescue ? 'Ditemukan' : 'Hilang', 
      };

      // Tambahkan validasi minimal
      if (!cleanData.nama_pelapor || !cleanData.telepon || !cleanData.lokasi) {
          return reply.status(400).send({ success: false, error: 'Data pelapor dan lokasi wajib diisi.' });
      }

      console.log("✅ Data Siap Simpan:", cleanData);

      const newId = await this.kucingModel.createLaporan(cleanData); 
      
      return reply.send({
        success: true,
        message: 'Laporan berhasil dibuat!',
        data: { id: newId }
      });
  
    } catch (error) {
      console.error("❌ Error Create:", error);
      // Kirim pesan error yang lebih jelas dari DB/Model ke Frontend
      return reply.status(500).send({ success: false, error: 'Gagal membuat laporan: ' + error.message });
    }
  }
}

module.exports = KucingController;