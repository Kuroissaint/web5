const { handleAjukanShelter } = require('../controllers/ShelterController');

module.exports = async function (fastify, opts) {
  const db = fastify.db;

  // 1. Cek Status User (Apakah 'user' atau 'shelter')
  fastify.get('/cek-status/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      // Mengambil status dari tabel pengguna
      const [rows] = await db.query("SELECT status FROM pengguna WHERE id = ?", [id]);
      if (rows.length === 0) {
        return reply.status(404).send({ success: false, message: "User tidak ditemukan" });
      }
      return { success: true, data: rows[0] };
    } catch (err) {
      return reply.status(500).send({ success: false, message: "Database Error" });
    }
  });

  async function shelterRoutes(fastify, options) {
    // Debug untuk Cek Status
    fastify.get('/cek-status/:id', async (request, reply) => {
      try {
        const { id } = request.params;
        console.log(`[DEBUG] Menjalankan cek-status untuk UID: ${id}`);
        
        // Menggunakan try-catch untuk menangkap error SQL
        const [rows] = await fastify.db.query("SELECT status FROM pengguna WHERE id = ?", [id]);
        
        console.log("[DEBUG] Hasil DB:", rows[0]);
        return { success: true, data: rows[0] || { status: 'user' } };
      } catch (error) {
        console.error("❌ ERROR DI CEK-STATUS:", error.message);
        // Kirim pesan error detail ke frontend agar kita tahu kolom apa yang hilang
        return reply.status(500).send({ 
          success: false, 
          error: error.message,
          hint: "Cek apakah kolom 'status' sudah ada di tabel pengguna" 
        });
      }
    });
}
  // 2. Kirim Pengajuan Form Shelter (Multipart)
  fastify.post('/ajukan-shelter', handleAjukanShelter);
};