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
  
  async getKucingByUserId(request, reply) {
    try {
      const { id } = request.params; // Mengambil ID dari URL (:id)
      
      const kucing = await this.kucingModel.getByUserId(id); 
      
      return reply.send({ success: true, data: kucing });
    } catch (error) {
      console.error("Error My Search:", error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Gagal mengambil laporan saya: ' + error.message 
      });
    }
  }

  async searchKucing(request, reply) {
    try {
      const { q, provinsi_id, kota, tags } = request.query;
      const kucing = await this.kucingModel.searchKucing({ 
        keyword: q, provinsi_id, kota, tags, status
      });
      return reply.send({ success: true, data: kucing });
    } catch (error) {
      return reply.status(500).send({ success: false, error: error.message });
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

  async getJenisKucing(request, reply) {
    try {
      const jenis = await this.kucingModel.getAllJenis();
      return reply.send({ success: true, data: jenis });
    } catch (error) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  }

  // ✅ VERSI REFAKTOR: Wajib Login & Pembersihan Logika
async createKucing(request, reply) {
  try {
    const parts = request.body;
    
    // 1. Ambil ID Pengguna langsung dari token JWT
    // Karena route ini sudah diproteksi authenticate, request.user pasti ada.
    const pengguna_id = request.user.id;

    // --- HELPER: Ambil value dengan aman (Anti-Null/Undefined) ---
    const getValue = (field) => {
      if (!field) return null;
      if (Array.isArray(field)) {
          const first = field[0];
          return first && first.value !== undefined ? first.value : first;
      }
      if (typeof field === 'object' && field.value !== undefined) return field.value;
      return field;
    };

    // 2. HANDLING FOTO (Menggunakan path absolut process.cwd())
    let uploadedFilenames = [];
    if (parts.foto) {
      const files = Array.isArray(parts.foto) ? parts.foto : [parts.foto];
      for (const file of files) {
        const filename = `${Date.now()}-${Math.floor(Math.random() * 1000)}-${file.filename}`;
        
        // Gunakan path.join(process.cwd(), 'uploads') agar konsisten dengan RescueController
        const savePath = path.join(process.cwd(), 'uploads', filename);
        
        // Pastikan folder ada
        if (!fs.existsSync(path.dirname(savePath))) {
          fs.mkdirSync(path.dirname(savePath), { recursive: true });
        }
        
        // Simpan file
        fs.writeFileSync(savePath, file._buf);
        uploadedFilenames.push(filename);
      }
    }

    
    // 3. LOGIKA FORM (Hilang vs Ditemukan)
    // Kita tetap pertahankan deteksi otomatis, tapi sekarang data terikat ke pengguna_id
    const isRescue = !getValue(parts.nama_kucing) && getValue(parts.nama);
    
    // Handling Tags
    let tagsData = [];
    const rawTags = parts.tags || parts.tag;
    if (rawTags) {
      const tagsArray = Array.isArray(rawTags) ? rawTags : [rawTags];
      tagsData = tagsArray.map(t => getValue(t));
    }

    // 4. SUSUN DATA (Hanya field yang benar-benar diperlukan)
    const cleanData = {
      pengguna_id: pengguna_id, // ✅ ID dari hasil login
      nama_pelapor: getValue(parts.nama_pelapor) || getValue(parts.nama), 
      telepon: getValue(parts.telepon),
      waktu_hilang: getValue(parts.waktu_hilang) || getValue(parts.waktu),
      lokasi: getValue(parts.lokasi),
      
      // Wilayah
      provinsi_id: getValue(parts.provinsi_id) || null,
      kabupaten_kota_id: getValue(parts.kabupaten_kota_id) || null,
      kecamatan_id: getValue(parts.kecamatan_id) || null,
      
      // Data Kucing
      nama_kucing: getValue(parts.nama_kucing) || (isRescue ? 'Kucing Rescue' : 'Kucing Hilang'),
      deskripsi: getValue(parts.deskripsi),
      ras: getValue(parts.ras) || (isRescue ? 'Kampung' : null), 
      
      fotos: uploadedFilenames,
      tags: tagsData,
      status: isRescue ? 'Ditemukan' : 'Hilang', 
    };

    // Validasi Minimal
    if (!cleanData.nama_pelapor || !cleanData.telepon || !cleanData.lokasi) {
        return reply.status(400).send({ success: false, error: 'Data pelapor dan lokasi wajib diisi.' });
    }

    console.log("✅ Laporan oleh User ID:", pengguna_id, "Data:", cleanData);

    const newId = await this.kucingModel.createLaporan(cleanData); 
    
    return reply.send({
      success: true,
      message: 'Laporan berhasil dibuat!',
      data: { id: newId }
    });

  } catch (error) {
    console.error("❌ Error Create Kucing:", error);
    return reply.status(500).send({ 
      success: false, 
      error: 'Gagal membuat laporan: ' + error.message 
    });
  }
}

// backend/src/controllers/KucingController.js
async updateStatusLaporan(request, reply) {
  try {
      const { id } = request.params;
      const { status } = request.body;
      await this.kucingModel.updateLaporanStatus(id, status);
      return reply.send({ success: true, message: 'Status berhasil diperbarui' });
  } catch (error) {
      return reply.status(500).send({ success: false, error: error.message });
  }
}

}

module.exports = KucingController;