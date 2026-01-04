// filepath: /home/wment/meowment/backend/src/routes/donasiRoutes.js
// File: donasiRoutes.js
const { createDonasi, getDonasiByUser, getDonasiById } = require('../controllers/DonasiController');
const { createPembayaran, getPembayaranStatus, handleWebhook, uploadBuktiBayar } = require('../controllers/PaymentController'); // <-- ADD uploadBuktiBayar here
const { getDonasiStats, updateDonasi } = require('../controllers/DonasiController');


// Validation schemas
const donasiSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['pengguna_id', 'nominal', 'frekuensi'],
      properties: {
        pengguna_id: { type: 'number' },
        nominal: { type: 'number' },
        frekuensi: { type: 'string', enum: ['sekali', 'bulanan'] },
        pesan_dukungan: { type: 'string' }
      }
    }
  }
};

const pembayaranSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['pengguna_id', 'jenis_transaksi', 'transaksi_id', 'metode_bayar', 'jumlah'],
      properties: {
        pengguna_id: { type: 'number' },
        jenis_transaksi: { type: 'string', enum: ['donasi', 'adopsi'] },
        transaksi_id: { type: 'number' },
        metode_bayar: { type: 'string', enum: ['transfer_bank', 'qris', 'e_wallet'] },
        jumlah: { type: 'number' },
        kode_transaksi: { type: 'string' }
      }
    }
  }
};

const webhookSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['transaction_status', 'order_id'],
      properties: {
        transaction_status: { type: 'string' },
        order_id: { type: 'string' },
        payment_type: { type: 'string' },
        gross_amount: { type: 'string' }
      }
    }
  }
};

async function donasiRoutes(fastify, options) {
  // DONASI ENDPOINTS
  fastify.post('/donasi', donasiSchema, createDonasi);
  fastify.get('/donasi/user/:pengguna_id', getDonasiByUser);
  fastify.get('/donasi/:id', getDonasiById);

  // PEMBAYARAN ENDPOINTS
  fastify.post('/pembayaran', pembayaranSchema, createPembayaran);
  fastify.get('/pembayaran/:kode_transaksi', getPembayaranStatus);
  fastify.post('/pembayaran/webhook', webhookSchema, handleWebhook);

  // UPLOAD BUKTI BAYAR
  fastify.post('/upload/bukti-bayar', {
    schema: {
      consumes: ['multipart/form-data']
    }
  }, uploadBuktiBayar);

  fastify.get('/donasi/stats', getDonasiStats);
  fastify.put('/donasi/:id', updateDonasi);
}

module.exports = donasiRoutes;