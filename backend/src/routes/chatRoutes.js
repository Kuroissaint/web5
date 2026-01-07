async function chatRoutes(fastify, options) {
    const db = fastify.db;
  
    // 1. Ambil Inbox (Daftar Chat)
    fastify.get('/conversations/:userId', async (request, reply) => {
      const { userId } = request.params;
      const query = `
        SELECT 
            p.id_percakapan,
            u.username AS nama_lawan_bicara, -- Sesuaikan jadi u.username
            u.foto_profil AS avatar_url,     -- Sesuaikan jadi u.foto_profil
            m.pesan AS pesan_terakhir,
            m.waktu AS waktu,
            (SELECT COUNT(*) FROM pesan WHERE id_percakapan = p.id_percakapan AND is_read = 0 AND pengirim_id != ?) AS unread_count
        FROM percakapan p
        JOIN pengguna u ON (p.id_user_1 = u.id OR p.id_user_2 = u.id)
        LEFT JOIN pesan m ON m.id_pesan = (SELECT MAX(id_pesan) FROM pesan WHERE id_percakapan = p.id_percakapan)
        WHERE (p.id_user_1 = ? OR p.id_user_2 = ?) AND u.id != ?
        ORDER BY m.waktu DESC`;
      
      const [rows] = await db.query(query, [userId, userId, userId, userId]);
      return { success: true, data: rows };
    });
  
    // 2. Ambil isi pesan
    fastify.get('/messages/:id_percakapan', async (request, reply) => {
      const { id_percakapan } = request.params;
      const [rows] = await db.query("SELECT * FROM pesan WHERE id_percakapan = ? ORDER BY waktu ASC", [id_percakapan]);
      return { success: true, data: rows };
    });
  
    // 3. Simpan pesan baru

    fastify.post('/send', async (request, reply) => {
        const { pengirim_id, penerima_id, pesan } = request.body;
        let { id_percakapan } = request.body;
    
        try {
        // 1. Jika id_percakapan tidak dikirim (chat baru), cari apakah mereka sudah punya percakapan
        if (!id_percakapan || id_percakapan === "null" || id_percakapan === 0) {
            const [existing] = await db.query(
            `SELECT id_percakapan FROM percakapan 
            WHERE (id_user_1 = ? AND id_user_2 = ?) 
            OR (id_user_1 = ? AND id_user_2 = ?)`,
            [pengirim_id, penerima_id, penerima_id, pengirim_id]
            );
    
            if (existing.length > 0) {
            id_percakapan = existing[0].id_percakapan;
            } else {
            // 2. Jika benar-benar baru, buat baris percakapan baru
            const [newConv] = await db.query(
                "INSERT INTO percakapan (id_user_1, id_user_2) VALUES (?, ?)",
                [pengirim_id, penerima_id]
            );
            id_percakapan = newConv.insertId;
            }
        }
    
        // 3. Simpan pesan ke tabel pesan menggunakan id_percakapan yang valid
        const [result] = await db.query(
            "INSERT INTO pesan (id_percakapan, pengirim_id, pesan, is_read) VALUES (?, ?, ?, 0)",
            [id_percakapan, pengirim_id, pesan]
        );
    
        return { 
            success: true, 
            id_pesan: result.insertId, 
            id_percakapan: id_percakapan // Kembalikan ID ini agar frontend bisa menyimpannya
        };
        } catch (error) {
        console.error("❌ Database Error Chat:", error.message);
        return reply.status(500).send({ 
            success: false, 
            message: "Database error", 
            error: error.message 
        });
        }
    });
  
    // 4. Tandai dibaca
    fastify.put('/read/:id_percakapan', { onRequest: [fastify.authenticate] }, async (request, reply) => {
      const { id_percakapan } = request.params;
      const userId = request.user.id;
      await db.query(
        "UPDATE pesan SET is_read = 1 WHERE id_percakapan = ? AND pengirim_id != ?",
        [id_percakapan, userId]
      );
      return { success: true };
    });
  }
  
  module.exports = chatRoutes;