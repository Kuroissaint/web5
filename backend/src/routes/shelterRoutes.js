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

  // 3. Endpoint untuk mengambil data pengajuan shelter (Untuk Admin)

  // Ambil semua pengajuan yang belum diproses (Admin Only)
    fastify.get('/admin/pengajuan', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        if (request.user.status !== 'admin') return reply.status(403).send({ message: "Akses ditolak" });
        
        const [rows] = await fastify.db.query(
            "SELECT ps.*, u.username FROM pengajuan_shelter ps JOIN pengguna u ON ps.pengguna_id = u.id WHERE ps.status = 'pending'"
        );
        return { success: true, data: rows };
    });

    // Proses Pengajuan (Approve/Reject)
    fastify.post('/admin/verifikasi-shelter', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { pengajuan_id, action } = request.body; // action: 'disetujui' atau 'ditolak'
        const db = fastify.db;

        try {
            // 1. Ambil data pengajuan untuk tahu siapa user-nya
            const [pengajuan] = await db.query("SELECT pengguna_id FROM pengajuan_shelter WHERE id = ?", [pengajuan_id]);
            if (pengajuan.length === 0) return reply.status(404).send({ message: "Data tidak ada" });

            const userId = pengajuan[0].pengguna_id;

            // 2. Update status di tabel pengajuan_shelter
            await db.query("UPDATE pengajuan_shelter SET status = ? WHERE id = ?", [action, pengajuan_id]);

            // 3. Jika disetujui, ubah status user di tabel pengguna menjadi 'shelter'
            if (action === 'disetujui') {
                await db.query("UPDATE pengguna SET status = 'shelter' WHERE id = ?", [userId]);
            }

            return { success: true, message: `Pengajuan berhasil di-${action}` };
        } catch (err) {
            return reply.status(500).send({ error: err.message });
        }
    });
};