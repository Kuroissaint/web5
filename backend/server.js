// backend/server.js
require('dotenv').config();
const path = require('path');
const fastify = require('fastify')({ logger: true });
const mysql = require('mysql2/promise');

// --- 1. KONEKSI DATABASE ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'meowment4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

fastify.decorate('db', pool);

// --- 2. FASTIFY PLUGINS & SOCKET.IO ---
fastify.register(require('@fastify/cors'), {
  origin: true
});

// Integrasi Socket.io ke Fastify
fastify.register(require('fastify-socket.io'), {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// --- 3. ROUTES REGISTRATION ---
// Route Chat Baru (Kita buat inline di sini atau via plugin)
fastify.register(require('./src/routes/chatRoutes'), { prefix: '/api/chat' });
fastify.register(require('./src/routes/wilayahRoutes'), { prefix: '/api' });
fastify.register(require('./src/routes/kucingRoutes'), { prefix: '/api/kucing' });
fastify.register(require('./src/routes/donasiRoutes'), { prefix: '/api/donasi' });
fastify.register(require('./src/routes/authRoutes'), { prefix: '/api/auth' });
fastify.register(require('./src/routes/rescueRoutes'), { prefix: '/api/rescue' });
fastify.register(require('./src/routes/pengajuanAdopsiRoutes'), { prefix: '/api' });
fastify.register(require('./src/routes/aplikasiAdopsiRoutes'), { prefix: '/api' });
// Tambahkan ini di server.js bersama route lainnya
// --- 4. LOGIKA REAL-TIME CHAT ---
fastify.ready((err) => {
  if (err) throw err;
  fastify.io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join_chat', (id_percakapan) => {
    socket.join(`room_${id_percakapan}`);
    console.log(`User join room: room_${id_percakapan}`);
  });
    socket.on('send_message', (data) => {
    fastify.io.to(`room_${data.id_percakapan}`).emit('receive_message', data);
  });
    socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
});

// --- 5. ERROR HANDLER & START ---
fastify.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.status(error.statusCode || 500).send({ success: false, message: error.message });
});

const start = async () => {
  try {
    const PORT = process.env.PORT || 3000;
    await fastify.ready();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();