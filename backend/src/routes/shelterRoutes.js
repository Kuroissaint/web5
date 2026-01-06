// src/routes/shelterRoutes.js

module.exports = async function (fastify, opts) {
  const db = fastify.db;

  fastify.get('/cek-status/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const [rows] = await db.query("SELECT status FROM pengguna WHERE id = ?", [id]);
      if (rows.length === 0) {
        return reply.status(404).send({ success: false, message: "User tidak ditemukan" });
      }
      return { success: true, data: rows[0] };
    } catch (err) {
      return reply.status(500).send({ success: false, message: "Database Error" });
    }
  });
};