const KucingController = require('../controllers/KucingController');

async function kucingRoutes(fastify, options) {
  const kucingController = new KucingController(fastify.db);

  fastify.get('/kucing', (request, reply) => 
    kucingController.getAllKucing(request, reply)
  );
  
  fastify.get('/kucing/:id', (request, reply) => 
    kucingController.getKucingById(request, reply)
  );
  fastify.put('/kucing/:id/status', (request, reply) => 
    kucingController.updateStatusLaporan(request, reply)
);
  
  fastify.post('/kucing', { onRequest: [fastify.authenticate] }, (request, reply) => 
    kucingController.createKucing(request, reply)
  );

  fastify.get('/kucing/search', (request, reply) => 
    kucingController.searchKucing(request, reply)
  );
  
  fastify.get('/tags', (request, reply) => 
    kucingController.getTags(request, reply)
  );

  fastify.get('/kucing/jenis', (request, reply) => 
    kucingController.getJenisKucing(request, reply)
  );

  fastify.get('/kucing/user/:id', (request, reply) => 
    kucingController.getKucingByUserId(request, reply)
  );
}

module.exports = kucingRoutes;