const KucingController = require('../controllers/KucingController');

async function kucingRoutes(fastify, options) {
  const kucingController = new KucingController(fastify.db);

  fastify.get('/kucing', (request, reply) => 
    kucingController.getAllKucing(request, reply)
  );
  
  fastify.get('/kucing/:id', (request, reply) => 
    kucingController.getKucingById(request, reply)
  );
  fastify.put('/kucing/:id/status', { onRequest: [fastify.authenticate] }, (req, res) => 
      kucingController.updateStatusLaporan(req, res)
  );

  fastify.delete('/kucing/:id', { onRequest: [fastify.authenticate] }, (req, res) => 
      kucingController.deleteSearch(req, res)
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

  // Rute untuk list "Kucing Saya" di Profil
  fastify.get('/kucing/saya/:userId', (request, reply) => 
    kucingController.getKucingSaya(request, reply)
  );

  // Rute untuk melihat pelamar di tiap kucing
  fastify.get('/kucing/pelamar/:kucingId', (request, reply) => 
    kucingController.getPelamarByKucing(request, reply)
  );

  // Rute untuk mengubah status pelamar (Terima/Tolak)
  fastify.put('/pelamar/status/:id', (request, reply) => 
    kucingController.updateStatusPelamar(request, reply)
  );

}

module.exports = kucingRoutes;