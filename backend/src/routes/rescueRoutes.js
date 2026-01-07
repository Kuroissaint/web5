const RescueController = require('../controllers/RescueController');

async function rescueRoutes(fastify, options) {
  // Menggunakan pengguna_id sesuai database Kuroissaint
  const rescueController = new RescueController(fastify.db || fastify.mysql);

  // Tambahkan { preHandler: [fastify.authenticate] } pada route yang wajib login
  fastify.post('/', { preHandler: [fastify.authenticate] }, (request, reply) =>
    rescueController.createRescue(request, reply)
  );

  fastify.delete('/:id', { preHandler: [fastify.authenticate] }, (request, reply) =>
    rescueController.deleteRescue(request, reply)
  );
  
  // Ambil Semua & Search (Mendukung filter ?pengguna_id=...)
  fastify.get('/', (request, reply) => rescueController.searchRescue(request, reply));

  // Ambil Detail
  fastify.get('/:id', (request, reply) => rescueController.getRescueById(request, reply));

  // Buat Laporan Baru
  fastify.post('/', (request, reply) => rescueController.createRescue(request, reply));

  // Update Status Penanganan
  fastify.patch('/:id', (request, reply) => rescueController.updateStatus(request, reply));

  // Hapus Laporan (Hanya jika belum diproses)
  fastify.delete('/:id', (request, reply) => rescueController.deleteRescue(request, reply));
}

module.exports = rescueRoutes;