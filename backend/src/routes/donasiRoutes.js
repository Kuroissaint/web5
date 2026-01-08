const DonasiController = require('../controllers/DonasiController');

async function donasiRoutes(fastify, options) {
    const donasiController = new DonasiController(fastify.db);

    // Ambil list shelter
    fastify.get('/donasi/shelters', (request, reply) => donasiController.listShelters(request, reply));
    
    fastify.get('/donasi/shelter/:id', (request, reply) => donasiController.getShelterDetail(request, reply));
    
    // Kirim bukti donasi
    fastify.post('/donasi/submit', (request, reply) => donasiController.submitDonasi(request, reply));
    
    // History donatur
    fastify.get('/donasi/history/:userId', (request, reply) => donasiController.getHistory(request, reply));
    
    // Update status (untuk shelter)
    fastify.put('/donasi/status/:id', (request, reply) => donasiController.updateStatus(request, reply));

    // 1. Ambil daftar donasi yang perlu diverifikasi (Admin Only)
    fastify.get('/admin/list-verifikasi', { onRequest: [fastify.authenticate] }, async (request, reply) => {
      if (request.user.status !== 'admin') return reply.status(403).send({ message: "Bukan Admin" });

      const query = `
          SELECT d.*, u.username as nama_donatur, s.username as nama_shelter 
          FROM donasi d
          JOIN pengguna u ON d.donatur_id = u.id
          JOIN pengguna s ON d.shelter_id = s.id
          WHERE d.status = 'pending'
      `;
      const [rows] = await fastify.db.query(query);
      return { success: true, data: rows };
    });

    // 2. Aksi Verifikasi (Approve/Reject)
    fastify.post('/admin/verifikasi-donasi', { onRequest: [fastify.authenticate] }, async (request, reply) => {
      const { donasi_id, action } = request.body; // action: 'verified' atau 'rejected'
      
      try {
          await fastify.db.query("UPDATE donasi SET status = ? WHERE id = ?", [action, donasi_id]);
          return { success: true, message: `Donasi berhasil di-${action}` };
      } catch (err) {
          return reply.status(500).send({ error: err.message });
      }
    });

  }

module.exports = donasiRoutes;