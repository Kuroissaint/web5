// backend/src/routes/authRoutes.js
const AuthController = require('../controllers/AuthController');

async function authRoutes(fastify, options) {
    fastify.post('/login', AuthController.login);
    fastify.post('/register', AuthController.register);
}

module.exports = authRoutes;