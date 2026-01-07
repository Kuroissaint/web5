const { handleAjukanShelter } = require('../controllers/ShelterController');

module.exports = async function (fastify, opts) {
  const db = fastify.db;

  // 1. Cek Status User (Apakah 'user' atau 'shelter')
  fastify.get('/cek-status/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Log untuk mempermudah debugging di console backend
      console.log(`[DEBUG] Mengecek status untuk User ID: ${id}`);
      
      // Mengambil status dari tabel pengguna
      const [rows] = await db.query("SELECT status FROM pengguna WHERE id = ?", [id]);
      
      if (rows.length === 0) {
        return reply.status(404).send({ 
          success: false, 
          message: "User tidak ditemukan" 
        });
      }

      console.log(`[DEBUG] Status User ${id}:`, rows[0].status);
      
      return { 
        success: true, 
        data: rows[0] // Mengembalikan { status: 'user' } atau { status: 'shelter' }
      };

    } catch (err) {
      console.error("❌ ERROR DATABASE (cek-status):", err.message);
      return reply.status(500).send({ 
        success: false, 
        message: "Database Error", 
        error: err.message,
        hint: "Pastikan kolom 'status' ada di tabel 'pengguna' dan koneksi DB aktif."
      });
    }
  });

  // 2. Kirim Pengajuan Form Shelter (Multipart)
  // Pastikan di server.js sudah terdaftar @fastify/multipart
  fastify.post('/ajukan-shelter', handleAjukanShelter);
};