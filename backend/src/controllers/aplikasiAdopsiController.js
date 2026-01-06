// backend/src/controllers/aplikasiAdopsiController.js

const AplikasiAdopsiModel = require('../models/aplikasiAdopsiModel');

class AplikasiAdopsiController {
    constructor(db) {
        this.db = db; 
        this.aplikasiAdopsiModel = new AplikasiAdopsiModel(db);
    }
    
    async submitAplikasiAdopsi(request, reply) {
        let connection;
        try {
            connection = await request.server.db.getConnection(); 
            await connection.beginTransaction(); 

            // --- HELPER: Ambil value dari FormData ---
            const getValue = (field) => {
                if (!field) return null;
                if (Array.isArray(field)) {
                    const first = field[0];
                    return first && first.value !== undefined ? first.value : first;
                }
                if (typeof field === 'object' && field.value !== undefined) return field.value;
                return field;
            };

            const parts = request.body;

            // Ambil data inti formulir
            const kucingId = getValue(parts.kucingId);
            const penggunaId = getValue(parts.penggunaId);
            const namaLengkap = getValue(parts.namaLengkap);
            const umur = getValue(parts.umur);
            const alamat = getValue(parts.alamat);
            const nohp = getValue(parts.nohp);
            const pekerjaan = getValue(parts.pekerjaan);
            const pernahPelihara = getValue(parts.pernahPelihara);
            const alasan = getValue(parts.alasan);
            
            // Data Wilayah
            const provinsiId = getValue(parts.provinsi_id);
            const kabupatenKotaId = getValue(parts.kabupaten_kota_id);
            const kecamatanId = getValue(parts.kecamatan_id);

            const parsedKucingId = parseInt(kucingId, 10);
            const parsedPenggunaId = parseInt(penggunaId, 10);

            // --- VALIDASI ---
            // Hanya validasi data wajib pengisi formulir
            if (isNaN(parsedKucingId) || isNaN(parsedPenggunaId) || !namaLengkap || !nohp) {
                 await connection.rollback();
                 return reply.status(400).send({ 
                    success: false, 
                    message: 'Mohon lengkapi Nama Lengkap, No HP, dan ID yang valid.' 
                });
            }

            // Validasi Wilayah
            if (!provinsiId || !kabupatenKotaId || !kecamatanId) {
                 await connection.rollback();
                 return reply.status(400).send({ 
                    success: false, 
                    message: 'Data wilayah (Provinsi, Kota, Kecamatan) wajib diisi.' 
                });
            }

            // --- PROSES SIMPAN DATA ---
            // Langsung simpan ke tabel aplikasi_adopsi
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
                provinsi_id: provinsiId,
                kabupaten_kota_id: kabupatenKotaId,
                kecamatan_id: kecamatanId
            }, connection);
            
            // Selesai: Simpan permanen ke DB
            await connection.commit();

            return reply.status(201).send({ 
                success: true,
                message: 'Formulir adopsi berhasil dikirim! Silahkan tunggu kabar selanjutnya.',
                data: {
                    aplikasi_id: resultAplikasi.insertId
                }
            });
            
        } catch (error) {
            if (connection) await connection.rollback();
            console.error("Error Submit Adopsi:", error);
            return reply.status(500).send({ 
                success: false, 
                message: `Gagal memproses formulir: ${error.message}` 
            });
        } finally {
            if (connection) connection.release();
        }
    }


    // Tambahkan ini di dalam class AplikasiAdopsiController
async getAdopsiSaya(request, reply) {
    try {
        const { userId } = request.params;
        // Pastikan di aplikasiAdopsiModel kamu sudah punya method getByUserId
        // Jika belum, kamu perlu menambahkannya di model
        const results = await this.aplikasiAdopsiModel.getByUserId(parseInt(userId));
        
        return reply.send({ 
            success: true, 
            data: results 
        });
    } catch (error) {
        console.error("Error getAdopsiSaya:", error);
        return reply.status(500).send({ 
            success: false, 
            message: `Gagal mengambil data adopsi: ${error.message}` 
        });
    }
}


}

module.exports = AplikasiAdopsiController;