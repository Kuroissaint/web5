require('dotenv').config();
const server = require('./server');

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Server error:', err);
    process.exit(1);
  }
  console.log(`🚀 Fastify server running on port ${PORT}`);
});