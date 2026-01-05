// backend/src/routes/chatRoutes.js
async function chatRoutes(fastify, options) {
  const db = fastify.db; // Mengambil pool database yang di-decorate di server.js

  // 1. Ambil daftar percakapan (Inbox)
  fastify.get('/conversations/:userId', async (request, reply) => {
    const { userId } = request.params;
    try {
      const [rows] = await db.query(
        `SELECT * FROM percakapan WHERE user_id_1 = ? OR user_id_2 = ?`,
        [userId, userId]
      );
      return { success: true, data: rows };
    } catch (err) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  });

  // 2. Ambil riwayat pesan dalam satu obrolan
  fastify.get('/messages/:percakapanId', async (request, reply) => {
    const { percakapanId } = request.params;
    try {
      const [rows] = await db.query(
        `SELECT * FROM pesan WHERE id_percakapan = ? ORDER BY waktu ASC`,
        [percakapanId]
      );
      return { success: true, data: rows };
    } catch (err) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  });

  // 3. Simpan pesan baru ke database (Penting untuk Socket.io)
  fastify.post('/send', async (request, reply) => {
    const { id_percakapan, pengirim_id, pesan, waktu } = request.body;
    try {
      await db.query(
        `INSERT INTO pesan (id_percakapan, pengirim_id, pesan, waktu, is_read) VALUES (?, ?, ?, ?, 0)`,
        [id_percakapan, pengirim_id, pesan, waktu]
      );
      return { success: true, message: 'Pesan terkirim' };
    } catch (err) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  });

  // 4. Tandai pesan sebagai dibaca
  fastify.put('/read/:percakapanId', async (request, reply) => {
    const { percakapanId } = request.params;
    try {
      await db.query(
        `UPDATE pesan SET is_read = 1 WHERE id_percakapan = ?`,
        [percakapanId]
      );
      return { success: true, message: 'Pesan dibaca' };
    } catch (err) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  });
}

module.exports = chatRoutes;