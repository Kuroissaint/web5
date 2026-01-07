// src/controllers/pengajuanAdopsiController.js
const PengajuanAdopsiModel = require('../models/pengajuanAdopsiModel');
const PenggunaModel = require('../models/penggunaModel'); 
const fs = require('fs').promises; 
const path = require('path');

class PengajuanAdopsiController {
    // Controller menerima objek 'db' dari server.js
    constructor(db) {
        this.db = db;
        this.pengajuanAdopsiModel = new PengajuanAdopsiModel(db);
        this.penggunaModel = new PenggunaModel(db);
    }
    
    // =================================================================
    // 1. METHOD: BUAT PENGAJUAN (DENGAN TRANSAKSI & MULTI-FOTO)
    // =================================================================
    async createPengajuanAdopsi(request, reply) {
      let connection;
      try {
          // 1. Mulai Transaksi menggunakan pool db
          connection = await this.db.getConnection();
          await connection.beginTransaction();

          const parts = request.body;

          // Helper untuk menangani field text dari FormData Fastify Multipart
          const getValue = (field) => {
              if (!field) return null;
              if (field.value !== undefined) return field.value;
              return field;
          };

          const penggunaId = getValue(parts.pengguna_id);

          // --- LANGKAH 1: Simpan Data Kucing Baru ---
          const [resKucing] = await connection.query(
            `INSERT INTO kucing (nama_kucing, jenis_kelamin, umur, warna_bulu, deskripsi, sudah_steril, status, created_at, pengguna_id, kategori) 
             VALUES (?, ?, ?, ?, ?, ?, 'tersedia', NOW(), ?, 'adopt')`, 
            [
                getValue(parts.namaKucing),
                getValue(parts.jenisKelamin),
                getValue(parts.usia),
                getValue(parts.warnaBulu),
                getValue(parts.deskripsi),
                getValue(parts.sudahSteril),
                penggunaId
            ]
        );
          
          const newKucingId = resKucing.insertId;

          // --- LANGKAH 2: Simpan Banyak Foto (FIX error toBuffer) ---
          if (parts.foto) {
              // Pastikan diproses sebagai array (jika user kirim > 1 foto)
              const files = Array.isArray(parts.foto) ? parts.foto : [parts.foto];
              
              for (const file of files) {
                  const filename = `${Date.now()}-${Math.floor(Math.random() * 1000)}-${file.filename}`;
                  const savePath = path.join(__dirname, '../../uploads', filename);
                  
                  // Pastikan folder uploads ada secara fisik
                  const uploadDir = path.dirname(savePath);
                  try { await fs.access(uploadDir); } catch { await fs.mkdir(uploadDir, { recursive: true }); }

                  // Ambil buffer secara aman (mendukung .toBuffer atau ._buf)
                  const buffer = typeof file.toBuffer === 'function' ? await file.toBuffer() : file._buf;
                  await fs.writeFile(savePath, buffer);

                  // Simpan referensi path ke tabel gambar
                  const urlGambar = `/uploads/${filename}`;
                  await connection.query(
                      `INSERT INTO gambar (jenis_entitas, entitas_id, url_gambar, nama_file) VALUES ('kucing', ?, ?, ?)`,
                      [newKucingId, urlGambar, filename]
                  );
              }
          }

          // --- LANGKAH 3: Simpan Data Detail Pengajuan ---
          await this.pengajuanAdopsiModel.create({
              pengguna_id: penggunaId,
              kucing_id: newKucingId,
              nama_lengkap: getValue(parts.nama_lengkap),
              telepon: getValue(parts.telepon),
              provinsi_id: getValue(parts.provinsi_id),
              kabupaten_kota_id: getValue(parts.kabupaten_kota_id),
              kecamatan_id: getValue(parts.kecamatan_id),
              alamat_lengkap: getValue(parts.alamat_lengkap),
              biaya_adopsi: getValue(parts.biayaAdopsi) || 0
          }, connection);

          // Selesaikan transaksi
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
    // 2. METHOD: GET PENGAJUAN USER
    // =================================================================
    async getPengajuanByUserId(request, reply) {
        try {
            const { userId } = request.params;
            const rows = await this.pengajuanAdopsiModel.getByUserId(userId); 

            return reply.send({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error("Error fetch pengajuan:", error);
            return reply.status(500).send({ success: false, message: error.message });
        }
    }

    async getAllPengajuanAdopsi(request, reply) {
        try {
             const rows = await this.pengajuanAdopsiModel.getAll(); 
             return reply.send({ success: true, data: rows });
        } catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }

    async getDetailPengajuanAdopsi(request, reply) {
        try {
            const { id } = request.params;
            const data = await this.pengajuanAdopsiModel.getById(id);
            if (!data) {
                return reply.status(404).send({ success: false, message: 'Pengajuan tidak ditemukan' });
            }
            return reply.send({ success: true, data: data });
        } catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }

    async updateStatusPengajuan(request, reply) {
        try {
            const { id } = request.params;
            const { status } = request.body;
            await this.pengajuanAdopsiModel.updateStatus(id, status);
            return reply.send({ success: true, message: 'Status berhasil diperbarui' });
        } catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }
}

module.exports = PengajuanAdopsiController;