const KucingController = require('../controllers/KucingController');

async function kucingRoutes(fastify, options) {
  const kucingController = new KucingController(fastify.db);

  fastify.get('/kucing', (request, reply) => 
    kucingController.getAllKucing(request, reply)
  );
  
  fastify.get('/kucing/:id', (request, reply) => 
    kucingController.getKucingById(request, reply)
  );
  
  fastify.post('/kucing', (request, reply) => 
    kucingController.createKucing(request, reply)
  );

  fastify.get('/kucing/search', (request, reply) => 
    kucingController.searchKucing(request, reply)
  );
  
  fastify.get('/tags', (request, reply) => 
    kucingController.getTags(request, reply)
  );
}

module.exports = kucingRoutes;