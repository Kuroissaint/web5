const AuthController = require('../controllers/AuthController');
const PenggunaModel = require('../models/penggunaModel');

async function authRoutes(fastify, options) {
    const authController = new AuthController(fastify.db);
    const penggunaModel = new PenggunaModel(fastify.db);

    fastify.post('/login', (req, res) => authController.login(req, res));
    fastify.post('/register', (req, res) => authController.register(req, res));
    fastify.get('/stats', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const userId = request.user.id;
        const stats = await penggunaModel.getStats(userId);
        return { success: true, data: stats };
    });
    fastify.put('/update-profile', 
        { preHandler: [fastify.authenticate] }, 
        (req, res) => authController.updateProfile(req, res)
    );
}

module.exports = authRoutes;