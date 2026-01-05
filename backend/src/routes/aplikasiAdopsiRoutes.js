// backend/src/routes/aplikasiAdopsiRoutes.js

const AplikasiAdopsiController = require('../controllers/aplikasiAdopsiController');

module.exports = async function (fastify, opts) {
    const db = fastify.db; 
    
    // Inisialisasi Controller dengan koneksi DB
    const controller = new AplikasiAdopsiController(db); 

    // Rute POST untuk submit aplikasi adopsi
    fastify.post('/adopsi/submit', controller.submitAplikasiAdopsi.bind(controller));
};