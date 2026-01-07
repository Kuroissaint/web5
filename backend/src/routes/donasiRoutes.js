const DonasiController = require('../controllers/DonasiController');

async function donasiRoutes(fastify, options) {
    const donasiController = new DonasiController(fastify.db);

    // Ambil list shelter
    fastify.get('/donasi/shelters', (request, reply) => donasiController.listShelters(request, reply));
    
    // Kirim bukti donasi
    fastify.post('/donasi/submit', (request, reply) => donasiController.submitDonasi(request, reply));
    
    // History donatur
    fastify.get('/donasi/history/:userId', (request, reply) => donasiController.getHistory(request, reply));
    
    // Update status (untuk shelter)
    fastify.put('/donasi/status/:id', (request, reply) => donasiController.updateStatus(request, reply));
}

module.exports = donasiRoutes;