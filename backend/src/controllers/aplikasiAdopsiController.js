// backend/src/controllers/aplikasiAdopsiController.js

const AplikasiAdopsiModel = require('../models/aplikasiAdopsiModel');
const PembayaranModel = require('../models/pembayaranModel');
const TransaksiAdopsiModel = require('../models/transaksiAdopsiModel');
const PengajuanAdopsiModel = require('../models/pengajuanAdopsiModel');

// Fungsi utility
const generateUniqueCode = () => `TX-${Date.now()}`; 
const generatePaymentUrl = (code) => `/payment/checkout/${code}`;

class AplikasiAdopsiController {
    constructor(db) {
        this.db = db; 
        this.aplikasiAdopsiModel = new AplikasiAdopsiModel(db);
        this.pengajuanAdopsiModel = new PengajuanAdopsiModel(db);
    }
    
    async submitAplikasiAdopsi(request, reply) {
        let connection;
        try {
            connection = await request.server.db.getConnection(); 
            await connection.beginTransaction(); 

            // --- HELPER: Ambil value dari FormData dengan aman ---
            const getValue = (field) => {
                if (!field) return null;
                if (Array.isArray(field)) {
                    const first = field[0];
                    return first && first.value !== undefined ? first.value : first;
                }
                if (typeof field === 'object' && field.value !== undefined) return field.value;
                return field;
            };

            const parts = request.body; // Ambil body raw

            // Ambil data menggunakan helper getValue
            const kucingId = getValue(parts.kucingId);
            const penggunaId = getValue(parts.penggunaId);
            const namaLengkap = getValue(parts.namaLengkap);
            const umur = getValue(parts.umur);
            const alamat = getValue(parts.alamat);
            const nohp = getValue(parts.nohp);
            const pekerjaan = getValue(parts.pekerjaan);
            const pernahPelihara = getValue(parts.pernahPelihara);
            const alasan = getValue(parts.alasan);
            const metodeBayar = getValue(parts.metodeBayar);
            
            // ✅ AMBIL DATA WILAYAH (PERBAIKAN DISINI)
            // Pastikan nama key ('provinsi_id' dst) SAMA dengan yang dikirim Frontend
            const provinsiId = getValue(parts.provinsi_id);
            const kabupatenKotaId = getValue(parts.kabupaten_kota_id);
            const kecamatanId = getValue(parts.kecamatan_id);

            // Bukti transfer logic
            const buktiFile = parts.file; 
            let bukti_transfer = null;

            if (buktiFile) {
                if (buktiFile.filename) {
                     const fs = require('fs');
                     const path = require('path');
                     const filename = `bukti-${Date.now()}-${buktiFile.filename}`;
                     const uploadPath = path.join(__dirname, '../../uploads/bukti-bayar');
                     
                     if (!fs.existsSync(uploadPath)) {
                        fs.mkdirSync(uploadPath, { recursive: true });
                     }
                     
                     const fullPath = path.join(uploadPath, filename);
                     if (buktiFile._buf) {
                        fs.writeFileSync(fullPath, buktiFile._buf);
                     } 
                     bukti_transfer = `http://localhost:3000/uploads/bukti-bayar/${filename}`;
                }
            }

            const parsedKucingId = parseInt(kucingId, 10);
            const parsedPenggunaId = parseInt(penggunaId, 10);

            // Validasi Kritis
            if (isNaN(parsedKucingId) || isNaN(parsedPenggunaId) || !metodeBayar || !namaLengkap) {
                 await connection.rollback();
                 return reply.status(400).send({ success: false, message: 'Data wajib atau ID tidak valid.' });
            }
            
            // Validasi Wilayah (Optional: Pastikan user mengisi wilayah)
            if (!provinsiId || !kabupatenKotaId || !kecamatanId) {
                 await connection.rollback();
                 return reply.status(400).send({ success: false, message: 'Data wilayah (Provinsi, Kota, Kecamatan) wajib diisi.' });
            }

            // Ambil email pengguna
            const emailPengguna = await this.aplikasiAdopsiModel.getEmailPengguna(parsedPenggunaId);
            if (!emailPengguna) {
                console.warn("Warning: Email pengguna tidak ditemukan, lanjut proses.");
            }

            // --- LANGKAH 1A: AMBIL BIAYA ADOPSI ---
            const pengajuanData = await this.pengajuanAdopsiModel.getPengajuanByKucingId(parsedKucingId, connection); 
            const biaya_adopsi = pengajuanData ? pengajuanData.biaya_adopsi : 0;

            // --- LANGKAH 1B: INSERT data ke APLIKASI_ADOPSI ---
            // ✅ UPDATE: Masukkan ID Wilayah ke database
            const resultAplikasi = await AplikasiAdopsiModel.create({
                pengguna_id: parsedPenggunaId,
                kucing_id: parsedKucingId, 
                nama_lengkap: namaLengkap,
                umur: umur,
                telepon: nohp, 
                alamat_lengkap: alamat, 
                pekerjaan: pekerjaan,
                pernah_pelihara_kucing: pernahPelihara,
                alasan_adopsi: alasan,
                // Masukkan variabel wilayah yang sudah diambil di atas
                provinsi_id: provinsiId,
                kabupaten_kota_id: kabupatenKotaId,
                kecamatan_id: kecamatanId
            }, connection);
            
            const aplikasi_adopsi_id = resultAplikasi.insertId;

            // --- LANGKAH 2: INSERT data ke PEMBAYARAN ---
            const kodeTransaksi = generateUniqueCode();
            const urlPembayaran = generatePaymentUrl(kodeTransaksi);

            const resultPembayaran = await PembayaranModel.create({
                pengguna_id: parsedPenggunaId, 
                jenis_transaksi: 'adopsi',
                jumlah: biaya_adopsi, 
                metode_bayar: metodeBayar,
                status: 'menunggu',
                kode_transaksi: kodeTransaksi,
                url_pembayaran: urlPembayaran,
            }, connection);
            const pembayaran_id = resultPembayaran.insertId;

            // --- LANGKAH 3: INSERT data ke TRANSAKSI_ADOPSI (Penghubung) ---
            await TransaksiAdopsiModel.create({
                aplikasi_adopsi_id: aplikasi_adopsi_id,
                bukti_transfer: bukti_transfer, 
                status_pembayaran: 'pending' 
            }, connection);
            
            // Selesai: Commit semua perubahan
            await connection.commit();

            return reply.status(201).send({ 
                success: true,
                message: 'Aplikasi dan pembayaran berhasil dibuat.',
                data: {
                    pembayaran_id: pembayaran_id,
                    kode_transaksi: kodeTransaksi,
                    url_pembayaran: urlPembayaran 
                }
            });
            
        } catch (error) {
            if (connection) await connection.rollback();
            request.log.error(error); 
            console.error("Error Submit Adopsi:", error);
            // Tampilkan pesan error spesifik dari database jika ada
            return reply.status(500).send({ success: false, message: `Gagal mengirim aplikasi adopsi: ${error.message}` });
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = AplikasiAdopsiController;