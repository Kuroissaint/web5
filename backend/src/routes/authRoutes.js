const AuthController = require('../controllers/AuthController');

async function authRoutes(fastify, options) {
    const authController = new AuthController(fastify.db); // Inisialisasi Class

    fastify.post('/login', (req, res) => authController.login(req, res));
    fastify.post('/register', (req, res) => authController.register(req, res));
    fastify.put('/update-profile', (req, res) => authController.updateProfile(req, res)); // Tambahkan rute ini
}

module.exports = authRoutes;