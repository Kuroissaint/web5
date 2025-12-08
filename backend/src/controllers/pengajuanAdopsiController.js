// src/controllers/pengajuanAdopsiController.js
const KucingModel = require('../models/KucingModel');
const PengajuanAdopsiModel = require('../models/pengajuanAdopsiModel'); // Diasumsikan nama file modelnya sudah diperbaiki
const PenggunaModel = require('../models/PenggunaModel'); 

// Menggunakan Promise-based fs jika diperlukan
const fs = require('fs').promises; 
const path = require('path');

class PengajuanAdopsiController {
    // Controller harus menerima objek 'db' dan menggunakannya untuk membuat instance Model
    constructor(db) {
        this.pengajuanAdopsiModel = new PengajuanAdopsiModel(db);
        this.penggunaModel = new PenggunaModel(db);
    }
    
    // =================================================================
    // 1. METHOD: BUAT PENGAJUAN (DENGAN TRANSAKSI)
    // =================================================================
    async createPengajuanAdopsi(request, reply) {
      let connection;
      try {
          // 1. Mulai Transaksi
          connection = await request.server.db.getConnection();
          await connection.beginTransaction();

          const parts = request.body;

          // Helper untuk menangani FormData yang mungkin berbentuk array/objek
          const getValue = (field) => {
              if (!field) return null;
              if (field.value !== undefined) return field.value;
              return field;
          };

          // --- LANGKAH 1: Simpan Data Kucing Baru ---
          // Kita insert manual ke tabel kucing agar dapat ID-nya
          const [resKucing] = await connection.query(
              `INSERT INTO kucing (nama_kucing, jenis_kelamin, umur, warna_bulu, deskripsi, sudah_steril, status, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, 'menunggu_verifikasi', NOW())`,
              [
                  getValue(parts.namaKucing),
                  getValue(parts.jenisKelamin), // Pastikan frontend kirim 'Jantan'/'Betina'
                  getValue(parts.usia),
                  getValue(parts.warnaBulu),
                  getValue(parts.deskripsi),
                  getValue(parts.sudahSteril)
              ]
          );
          
          const newKucingId = resKucing.insertId; // ID Kucing didapat!

          // --- LANGKAH 2: Simpan Foto Kucing (Jika ada) ---
          if (parts.foto) {
              const file = parts.foto;
              const filename = `${Date.now()}-${Math.floor(Math.random() * 1000)}-${file.filename}`;
              const savePath = path.join(__dirname, '../../uploads', filename);
              
              // Simpan file fisik
              if (!require('fs').existsSync(path.dirname(savePath))) require('fs').mkdirSync(path.dirname(savePath), { recursive: true });
              await require('fs').promises.writeFile(savePath, await file.toBuffer());

              // Simpan path ke DB
              const urlGambar = `/uploads/${filename}`;
              await connection.query(
                  `INSERT INTO gambar (jenis_entitas, entitas_id, url_gambar, nama_file) VALUES ('kucing', ?, ?, ?)`,
                  [newKucingId, urlGambar, filename]
              );
          }

          // --- LANGKAH 3: Simpan Pengajuan Adopsi ---
          // Menggunakan ID Kucing yang baru dibuat
          await this.pengajuanAdopsiModel.create({
              pengguna_id: getValue(parts.pengguna_id),
              kucing_id: newKucingId, // PENTING: Link ke kucing baru
              nama_lengkap: getValue(parts.nama_lengkap),
              telepon: getValue(parts.telepon),
              provinsi_id: getValue(parts.provinsi_id),
              kabupaten_kota_id: getValue(parts.kabupaten_kota_id),
              kecamatan_id: getValue(parts.kecamatan_id),
              alamat_lengkap: getValue(parts.alamat_lengkap),
              biaya_adopsi: getValue(parts.biayaAdopsi) || 0
          }, connection);

          await connection.commit();

          return reply.status(201).send({ 
              success: true,
              message: "Berhasil mengajukan kucing untuk adopsi", 
              id: newKucingId 
          });
          
      } catch (error) {
          if (connection) await connection.rollback();
          console.error("Gagal create pengajuan:", error);
          return reply.status(500).send({ success: false, message: error.message });
      } finally {
          if (connection) connection.release();
      }
  }

    // =================================================================
    // 2. METHOD: GET PENGAJUAN USER (menggantikan exports.getPengajuanUser)
    // =================================================================
    async getPengajuanByUserId(request, reply) {
        try {
            // Ambil parameter dari request.params Fastify
            const userId = request.params.pengguna_id;

            // Panggil model menggunakan async/await
            const rows = await this.pengajuanAdopsiModel.getByUserId(userId); 

            // Respon Fastify
            return reply.send({
                success: true,
                data: rows
            });
            
        } catch (error) {
            console.error("Error fetch pengajuan:", error);
            throw new Error(`Gagal mengambil data pengajuan user: ${error.message}`); 
        }
    }
    
    // --- TAMBAH METHOD LAIN YANG MUNGKIN DIPERLUKAN (sesuai routes) ---

    // Contoh: Method yang dipanggil di rute fastify.get('/pengajuan', ...)
    async getAllPengajuanAdopsi(request, reply) {
        // Implementasi untuk ambil semua pengajuan
        try {
             const rows = await this.pengajuanAdopsiModel.getAll(); 
             return reply.send({ success: true, data: rows });
        } catch (error) {
             throw new Error(`Gagal mengambil semua pengajuan: ${error.message}`);
        }
    }
    
    // Contoh: Method yang dipanggil di rute fastify.get('/pengajuan/:id', ...)
    async getDetailPengajuanAdopsi(request, reply) {
        // Implementasi untuk ambil detail pengajuan berdasarkan ID
        try {
            const { id } = request.params;
            const data = await this.pengajuanAdopsiModel.getById(id);
            if (!data) {
                return reply.status(404).send({ success: false, message: 'Pengajuan tidak ditemukan' });
            }
            return reply.send({ success: true, data: data });
        } catch (error) {
            throw new Error(`Gagal mengambil detail pengajuan: ${error.message}`);
        }
    }
    
    // Contoh: Method yang dipanggil di rute fastify.put('/pengajuan/:id/status', ...)
    async updateStatusPengajuan(request, reply) {
        // Implementasi untuk update status
        try {
            const { id } = request.params;
            const { status } = request.body;
            await this.pengajuanAdopsiModel.updateStatus(id, status);
            return reply.send({ success: true, message: 'Status berhasil diupdate' });
        } catch (error) {
            throw new Error(`Gagal mengupdate status: ${error.message}`);
        }
    }
}

module.exports = PengajuanAdopsiController;