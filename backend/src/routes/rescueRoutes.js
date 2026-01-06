// backend/src/routes/rescueRoutes.js
const RescueController = require('../controllers/RescueController');

async function rescueRoutes(fastify, options) {
  // Pastikan fastify.db tersedia, jika tidak gunakan fastify.mysql (tergantung plugin kamu)
  const rescueController = new RescueController(fastify.db || fastify.mysql);

  // 1. Ambil Semua / Search
  fastify.get('/', (request, reply) =>
    rescueController.searchRescue(request, reply)
  );

  // 2. Ambil Detail (Berdasarkan ID)
  fastify.get('/:id', (request, reply) =>
    rescueController.getRescueById(request, reply)
  );

  // 3. Buat Laporan Baru
  fastify.post('/', (request, reply) =>
    rescueController.createRescue(request, reply)
  );

  // 4. Update Status (Dua method ini sekarang mengarah ke fungsi yang sama)
  // Ini untuk axios.patch('/rescue/32')
  fastify.patch('/:id', (request, reply) => 
    rescueController.updateStatus(request, reply)
  );

  // Ini untuk cara lama jika masih ada yang pakai .put('/rescue/32/status')
  fastify.put('/:id/status', (request, reply) => 
    rescueController.updateStatus(request, reply)
  );

  // 5. Hapus Laporan
  fastify.delete('/:id', (request, reply) =>
    rescueController.deleteRescue(request, reply)
  );
}

module.exports = rescueRoutes;
