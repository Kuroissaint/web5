const WilayahController = require('../controllers/WilayahController');

async function wilayahRoutes(fastify, options) {
  const wilayahController = new WilayahController(fastify.db);

  // Endpoint: /api/wilayah/provinsi
  // Endpoint: /api/wilayah/kota/:id
  fastify.get('/wilayah/:type', (req, reply) => wilayahController.getWilayah(req, reply));
  fastify.get('/wilayah/:type/:id', (req, reply) => wilayahController.getWilayah(req, reply));
}

module.exports = wilayahRoutes;