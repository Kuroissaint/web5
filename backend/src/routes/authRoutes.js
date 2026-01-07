const AuthController = require('../controllers/AuthController');

async function authRoutes(fastify, options) {
    const authController = new AuthController(fastify.db);

    fastify.post('/login', (req, res) => authController.login(req, res));
    fastify.post('/register', (req, res) => authController.register(req, res));
    
    // TAMBAHKAN PROTEKSI AUTHENTICATE DI SINI
    fastify.put('/update-profile', 
        { preHandler: [fastify.authenticate] }, 
        (req, res) => authController.updateProfile(req, res)
    );
}

module.exports = authRoutes;