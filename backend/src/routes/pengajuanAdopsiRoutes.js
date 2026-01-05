// src/routes/pengajuanAdopsiRoutes.js

const PengajuanAdopsiController = require('../controllers/PengajuanAdopsiController');


module.exports = async function (fastify, opts) {
    // 1. Ambil koneksi DB yang sudah didekorasi di server.js
    const db = fastify.db; 
    
    // 2. Inisialisasi Controller dengan koneksi DB (Dependency Injection)
    const controller = new PengajuanAdopsiController(db); 

    // 3. DAFTARKAN ROUTES
    
    // Rute untuk membuat pengajuan adopsi baru
    fastify.post('/pengajuan', controller.createPengajuanAdopsi.bind(controller));
    
    // Rute untuk mendapatkan semua daftar pengajuan (misal untuk Admin/Pemilik)
    fastify.get('/pengajuan', controller.getAllPengajuanAdopsi.bind(controller));
    
    // Rute untuk mendapatkan detail pengajuan spesifik
    fastify.get('/pengajuan/:id', controller.getDetailPengajuanAdopsi.bind(controller));
    
    // Rute untuk mengupdate status pengajuan (misal 'Diterima' atau 'Ditolak')
    fastify.put('/pengajuan/:id/status', controller.updateStatusPengajuan.bind(controller));
    
    // Rute untuk mendapatkan pengajuan berdasarkan ID pengguna (untuk My Adoption List)
    fastify.get('/pengajuan/user/:userId', controller.getPengajuanByUserId.bind(controller));
};