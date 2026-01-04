const RescueController = require('../controllers/RescueController');

async function rescueRoutes(fastify, options) {
  const rescueController = new RescueController(fastify.db);

  fastify.get('/', (request, reply) =>
    rescueController.searchRescue(request, reply)
  );

  fastify.get('/:id', (request, reply) =>
    rescueController.getRescueById(request, reply)
  );

  fastify.post('/', { onRequest: [fastify.authenticate] }, (request, reply) =>
    rescueController.createRescue(request, reply)
  );

  fastify.put('/:id/status', (request, reply) =>
    rescueController.updateStatus(request, reply)
  );

  fastify.delete('/:id', (request, reply) =>
    rescueController.deleteRescue(request, reply)
  );

}

// Ekspor fungsi utama
module.exports = rescueRoutes;
