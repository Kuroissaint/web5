const db = require("../config/db"); // Pastikan path ke koneksi database sudah benar

const ChatController = {
  // 1. Mengambil daftar percakapan (Inbox) untuk satu user
  getConversations: async (req, res) => {
    const { userId } = req.params;
    try {
      const [rows] = await db.query(
        `SELECT 
            p.id_percakapan,
            p.created_at,
            u.nama AS participant_name,
            u.foto AS participant_avatar,
            m.pesan AS last_message,
            m.waktu AS last_message_time,
            (SELECT COUNT(*) FROM pesan 
             WHERE id_percakapan = p.id_percakapan 
             AND is_read = 0 
             AND pengirim_id != ?) AS unread_count
         FROM percakapan p
         JOIN users u ON (p.id_user_1 = u.id OR p.id_user_2 = u.id)
         LEFT JOIN pesan m ON m.id_pesan = (
            SELECT MAX(id_pesan) FROM pesan WHERE id_percakapan = p.id_percakapan
         )
         WHERE (p.id_user_1 = ? OR p.id_user_2 = ?) AND u.id != ?
         ORDER BY m.waktu DESC`,
        [userId, userId, userId, userId]
      );
      res.status(200).json(rows);
    } catch (error) {
      console.error("Error getConversations:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // 2. Mengambil semua pesan dalam satu percakapan
  getMessages: async (req, res) => {
    const { id_percakapan } = req.params;
    try {
      const [rows] = await db.query(
        "SELECT * FROM pesan WHERE id_percakapan = ? ORDER BY waktu ASC",
        [id_percakapan]
      );
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 3. Mengirim pesan (Menangani chat baru atau chat lama)
  saveMessage: async (req, res) => {
    const { id_percakapan, pengirim_id, penerima_id, pesan } = req.body;

    try {
      let current_id_percakapan = id_percakapan;

      // Jika tidak ada ID percakapan, cek dulu apakah sudah pernah ada percakapan antara kedua user
      if (!current_id_percakapan) {
        const [existing] = await db.query(
          "SELECT id_percakapan FROM percakapan WHERE (id_user_1 = ? AND id_user_2 = ?) OR (id_user_1 = ? AND id_user_2 = ?)",
          [pengirim_id, penerima_id, penerima_id, pengirim_id]
        );

        if (existing.length > 0) {
          current_id_percakapan = existing[0].id_percakapan;
        } else {
          // Buat percakapan baru jika benar-benar belum ada
          const [newConversation] = await db.query(
            "INSERT INTO percakapan (id_user_1, id_user_2) VALUES (?, ?)",
            [pengirim_id, penerima_id]
          );
          current_id_percakapan = newConversation.insertId;
        }
      }

      // Simpan pesan ke database
      const [result] = await db.query(
        "INSERT INTO pesan (id_percakapan, pengirim_id, pesan, is_read) VALUES (?, ?, ?, 0)",
        [current_id_percakapan, pengirim_id, pesan]
      );

      res.status(201).json({
        id_pesan: result.insertId,
        id_percakapan: current_id_percakapan,
        message: "Pesan terkirim",
      });
    } catch (error) {
      console.error("Error saveMessage:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // 4. Fitur Baru: Menandai pesan sebagai telah dibaca
  markAsRead: async (req, res) => {
    const { id_percakapan } = req.params;
    const userId = req.user.id; // Diambil dari middleware authenticateToken

    try {
      await db.query(
        "UPDATE pesan SET is_read = 1 WHERE id_percakapan = ? AND pengirim_id != ? AND is_read = 0",
        [id_percakapan, userId]
      );
      res.status(200).json({ message: "Pesan telah diperbarui ke status dibaca" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = ChatController;