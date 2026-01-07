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
        const { pengirim_id, pesan } = request.body;
        let { id_percakapan, penerima_id } = request.body;

        try {
            // 1. Validasi id_percakapan: Apakah ini ID Ruangan yang beneran ada?
            let isConversationValid = false;
            if (id_percakapan && id_percakapan !== "null" && id_percakapan !== 0) {
                const [check] = await db.query("SELECT id_percakapan FROM percakapan WHERE id_percakapan = ?", [id_percakapan]);
                if (check.length > 0) isConversationValid = true;
            }

            // --- VALIDASI TAMBAHAN ---
            if (penerima_id === "undefined" || penerima_id === "null" || !penerima_id) {
                // Jika id_percakapan adalah angka valid, gunakan itu sebagai backup
                if (id_percakapan && !isNaN(id_percakapan)) {
                    // Lanjut ke pengecekan percakapan
                } else {
                    return reply.status(400).send({ 
                        success: false, 
                        message: "ID Penerima tidak valid (undefined). Pastikan data pemilik kucing tersedia." 
                    });
                }
            }

            // 2. Jika ID Ruangan TIDAK VALID, berarti 'id' yang dikirim adalah ID User Lawan
            if (!isConversationValid) {
                // Jika id_percakapan ternyata adalah ID User, pindahkan ke penerima_id
                if (!penerima_id) penerima_id = id_percakapan;

                // Cari apakah mereka sudah punya percakapan sebelumnya
                const [existing] = await db.query(
                    `SELECT id_percakapan FROM percakapan 
                    WHERE (id_user_1 = ? AND id_user_2 = ?) 
                    OR (id_user_1 = ? AND id_user_2 = ?)`,
                    [pengirim_id, penerima_id, penerima_id, pengirim_id]
                );

                if (existing.length > 0) {
                    id_percakapan = existing[0].id_percakapan;
                } else {
                    // Buat percakapan baru. Pastikan penerima_id adalah ID User yang valid!
                    const [newConv] = await db.query(
                        "INSERT INTO percakapan (id_user_1, id_user_2) VALUES (?, ?)",
                        [pengirim_id, penerima_id]
                    );
                    id_percakapan = newConv.insertId;
                }
            }

            // 3. Simpan pesan
            const [result] = await db.query(
                "INSERT INTO pesan (id_percakapan, pengirim_id, pesan, is_read) VALUES (?, ?, ?, 0)",
                [id_percakapan, pengirim_id, pesan]
            );

            return { success: true, id_pesan: result.insertId, id_percakapan: id_percakapan };
        } catch (error) {
            console.error("❌ Database Error Chat:", error.message);
            return reply.status(500).send({ success: false, error: error.message });
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