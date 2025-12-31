// backend/server.js
require('dotenv').config();
const path = require('path');
const fastify = require('fastify')({ logger: true });
const mysql = require('mysql2/promise');

// --- 1. KONEKSI DATABASE ---
// (Bagian ini tetap sama, karena terbukti berhasil)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'meowment4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    // Exit jika koneksi DB gagal, karena server tidak berguna tanpa DB
    process.exit(1); 
  });

fastify.decorate('db', pool);

// --- 2. FASTIFY PLUGINS & STATIC (Tetap Sama) ---
fastify.register(require('@fastify/cors'), {
  origin: [
    'http://localhost:5173', 'http://localhost:3000', 
    'http://localhost:5174', 'http://127.0.0.1:5174' 
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
});

fastify.register(require('@fastify/multipart'), { 
  attachFieldsToBody: true,
  limits: { fileSize: 5 * 1024 * 1024 }
});

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads/',
});

fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'rahasia_super_aman_meowment' 
});

//Decorator untuk proteksi route
fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ success: false, message: "Sesi habis atau token salah. Silakan login kembali." });
  }
});

// --- 3. PENDATAAN ROUTES & HEALTH CHECK ---

fastify.get('/health', async (request, reply) => {
  return { status: 'OK', message: 'Server is running' };
});

fastify.register(require('./src/routes/kucingRoutes'), { prefix: '/api' });
fastify.register(require('./src/routes/wilayahRoutes'), { prefix: '/api' });
fastify.register(require('./src/routes/donasiRoutes'), { prefix: '/api' });
fastify.register(require('./src/routes/authRoutes'), { prefix: '/api/auth' }); 
fastify.register(require('./src/routes/rescueRoutes'), { prefix: '/api/rescue' }); 
fastify.register(require('./src/routes/pengajuanAdopsiRoutes'), { prefix: '/api' }); 
fastify.register(require('./src/routes/aplikasiAdopsiRoutes'), { prefix: '/api' });

// --- 4. ERROR HANDLER ---

fastify.setErrorHandler((error, request, reply) => {
  // ... (Error handling logic tetap sama) ...
  request.log.error(error);
  
  if (error.validation) {
    return reply.status(400).send({ success: false, message: 'Validation error', errors: error.validation });
  }
  
  if (error.code?.startsWith('ER_')) {
    return reply.status(500).send({ success: false, message: 'Database error', error: error.message });
  }
  
  reply.status(error.statusCode || 500).send({ success: false, message: error.message || 'Internal server error' });
});

// --- 5. FUNGSI START UTAMA (MENGGUNAKAN fastify.ready) ---

const start = async () => {
  try {
    const PORT = process.env.PORT || 3000;
    
    // ✅ PERBAIKAN: Gunakan fastify.ready() untuk memastikan semua register selesai sebelum listen
    await fastify.ready();
    
    await fastify.listen({ 
      port: PORT,
      host: '127.0.0.1' // Gunakan host spesifik 127.0.0.1
    });
    
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    
  } catch (err) {
    // Tangkap error jika listen() gagal (misal: EADDRINUSE) atau error di ready()
    console.error('Error starting server (Fatal):', err);
    process.exit(1);
  }
};

start();