// src/controllers/RescueController.js

const RescueModel = require('../models/RescueModel');
const GambarModel = require("../models/GambarModel");

// ✅ PERBAIKAN IMPORT: Menggunakan path dan fs/promises secara konsisten di bagian atas
const path = require('path'); 
const fs = require('fs').promises; 

function extract(val) {
  return typeof val === "object" && val !== null ? val.value : val;
}

class RescueController {
  constructor(db) {
    this.rescueModel = new RescueModel(db);
    this.gambarModel = new  GambarModel(db); // ⭐ Pastikan GambarModel diinisialisasi
  }
  
  // ... (Method searchRescue, getRescueById, updateStatus, deleteRescue tetap sama) ...

  // ✅ FUNGSI BARU: searchRescue (Pengganti getAll & fetchUserReports)
async searchRescue(request, reply) {
    try {
        const { ids, status } = request.query; 

        let idsArray = [];
        if (ids) {
            idsArray = ids.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
        }
        
        const laporan = await this.rescueModel.searchRescue({ 
            status: status,
            ids: idsArray
        });
        
        return reply.send({
            success: true,
            message: 'Berhasil mencari laporan rescue',
            data: laporan
        });
    } catch (error) {
        // PERBAIKAN ERROR HANDLING: Menggunakan throw untuk ditangani Error Handler global Fastify
        throw new Error('Gagal mencari laporan rescue: ' + error.message);
    }
}

  async getRescueById(request, reply) {
    try {
      const { id } = request.params;
      const data = await this.rescueModel.getById(id);

      if (!data) {
        return reply.status(404).send({
          success: false,
          message: 'Data rescue tidak ditemukan'
        });
      }
      return reply.send({
        success: true,
        message: 'Berhasil mendapatkan detail rescue',
        data
      });
    } catch (error) {
        throw new Error('Gagal mendapatkan detail rescue: ' + error.message);
    }
  }

  async createRescue(request, reply) {
    try {
      // 1. Ambil ID Pengguna langsung dari JWT (Request User)
      // Logika manual pengambilan dari body dihapus karena sudah dijamin oleh middleware authenticate
      const pengguna_id = request.user.id;
  
      console.log("REQUEST BODY:", request.body);
  
      const nama_pelapor    = extract(request.body.nama_pelapor);
      const telepon         = extract(request.body.telepon);
      const lokasi_penemuan = extract(request.body.lokasi_penemuan);
      const deskripsi       = extract(request.body.deskripsi);
      const waktu_penemuan  = extract(request.body.waktu_penemuan);
      
      const tag_id_raw = extract(request.body.tag_id);
      const tag_id = tag_id_raw ? parseInt(tag_id_raw) : null;
  
      // 2. Insert data kucing dasar (status: 'liar')
      const kucingData = {
        nama_kucing: "Tidak Diketahui",
        jenis_kucing_id: null,
        jenis_kelamin: null,
        tanggal_lahir: null,
        warna_bulu: null,
        deskripsi: deskripsi || null,
        sudah_steril: null,
        status: 'liar',
        dibuat_oleh: pengguna_id, // ID dari hasil login
        created_at: new Date(),
        updated_at: new Date()
      };
      const kucingId = await this.rescueModel.createKucing(kucingData);
  
      // 3. Insert laporan rescue
      const laporanId = await this.rescueModel.create({
        nama_pelapor,
        telepon,
        lokasi_penemuan,
        deskripsi,
        pengguna_id, // ID dari hasil login
        kucing_id: kucingId,
        waktu_penemuan,
        tag_id,
      });
  
      // 4. Insert tag kucing (jika ada)
      if (tag_id) {
        await this.rescueModel.addTagKucing({
          kucing_id: kucingId,
          tag_id,
          created_at: new Date()
        });
      }
  
      // 5. Handling Upload Gambar (Multipart)
      if (request.isMultipart()) {
        try {
          const file = request.body.gambar;
  
          if (file && file.filename) {
            const buffer = await file.toBuffer();
            const filename = `${Date.now()}_${file.filename}`;
            
            // Menggunakan path absolut untuk keamanan penyimpanan file
            const absolutePath = path.join(process.cwd(), 'uploads', filename);
            await fs.writeFile(absolutePath, buffer);
  
            // Simpan informasi gambar ke DB
            await this.gambarModel.addGambar({
              jenis_entitas: "laporan_rescue",
              entitas_id: laporanId,
              url_gambar: `/uploads/${filename}`,
              nama_file: filename,
              urutan_tampil: 1
            });
            console.log("📌 GAMBAR BERHASIL DIMASUKKAN KE DB");
          }
        } catch (err) {
          console.error("ERROR SAAT MEMPROSES GAMBAR:", err);
          throw err; 
        }
      }
  
      return reply.send({
        success: true,
        message: "Laporan rescue berhasil dibuat",
        id: laporanId
      });
  
    } catch (error) {
      console.error("❌ KESALAHAN KRITIS CREATE RESCUE:", error);
      // Melempar error agar diproses oleh Error Handler global di server.js
      throw new Error('Terjadi kesalahan saat membuat laporan rescue: ' + error.message);
    }
  }
  async updateStatus(request, reply) {
    try {
      const { id } = request.params;
      const { status } = request.body;

      await this.rescueModel.updateStatus(id, status);

      return reply.send({
        success: true,
        message: 'Status laporan rescue berhasil diupdate'
      });
    } catch (error) {
        throw new Error('Gagal update status laporan rescue: ' + error.message);
    }
  }

  async deleteRescue(request, reply) {
    try {
      const { id } = request.params;

      await this.rescueModel.delete(id);

      return reply.send({
        success: true,
        message: 'Laporan rescue berhasil dihapus'
      });
    } catch (error) {
        throw new Error('Gagal menghapus laporan rescue: ' + error.message);
    }
  }
}

module.exports = RescueController;