// backend/src/controllers/PaymentController.js
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');   // ✅ Tambahan Wajib
const path = require('path'); // ✅ Tambahan Wajib

// --------------------------------------------------------
// HELPER FUNCTION: Log Payment Status
// --------------------------------------------------------
async function logPaymentStatus(db, pembayaranId, statusSebelum, statusSesudah, catatan, dibuatOleh = null) {
  try {
    await db.execute(
      `INSERT INTO log_pembayaran 
       (pembayaran_id, status_sebelum, status_sesudah, catatan, dibuat_oleh) 
       VALUES (?, ?, ?, ?, ?)`,
      [pembayaranId, statusSebelum, statusSesudah, catatan, dibuatOleh]
    );
  } catch (error) {
    console.error('Error logging payment status:', error.message);
  }
}

function generateTransactionCode(prefix = 'TRX') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

function generateVirtualAccount(bankCode) {
  const prefixes = { 'bca': '89308', 'bni': '8277', 'bri': '88888', 'mandiri': '89508' };
  const prefix = prefixes[bankCode] || '89999';
  const random = Math.floor(100000000 + Math.random() * 900000000);
  return prefix + random.toString().substr(0, 10 - prefix.length);
}

// --------------------------------------------------------
// 1. Create payment record
// --------------------------------------------------------
async function createPembayaran(request, reply) {
  const { pengguna_id, jenis_transaksi, transaksi_id, metode_bayar, jumlah } = request.body;
  
  try {
    const db = request.server.db;
    const kode_transaksi = generateTransactionCode();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1); 

    const statusAwal = 'menunggu';
    let vaNumber = null;

    if (metode_bayar === 'transfer_bank') {
      vaNumber = generateVirtualAccount('bca'); 
    } 

    const [result] = await db.execute(
      `INSERT INTO pembayaran 
       (pengguna_id, jenis_transaksi, transaksi_id, metode_bayar, jumlah, kode_transaksi, status, va_number, waktu_kedaluwarsa) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pengguna_id, jenis_transaksi, transaksi_id, metode_bayar, jumlah, kode_transaksi, statusAwal, vaNumber, expiryDate]
    );

    await logPaymentStatus(db, result.insertId, null, statusAwal, `Pembayaran dibuat (${metode_bayar}).`, pengguna_id);

    const [pembayaran] = await db.execute('SELECT * FROM pembayaran WHERE id = ?', [result.insertId]);

    return reply.send({
      success: true,
      message: 'Payment record created',
      data: pembayaran[0]
    });

  } catch (error) {
    request.log.error('Error creating payment:', error);
    return reply.status(500).send({ success: false, message: 'Failed to create payment', error: error.message });
  }
}

// --------------------------------------------------------
// 2. Get payment status
// --------------------------------------------------------
async function getPembayaranStatus(request, reply) {
  const { kode_transaksi } = request.params;

  try {
    const db = request.server.db;
    const [pembayaran] = await db.execute(
      'SELECT id, kode_transaksi, jumlah, status, va_number, waktu_kedaluwarsa, metode_bayar FROM pembayaran WHERE kode_transaksi = ?',
      [kode_transaksi]
    );

    if (pembayaran.length === 0) {
      return reply.status(404).send({ success: false, message: 'Transaction not found' });
    }

    const [logs] = await db.execute(
      'SELECT status_sebelum, status_sesudah, catatan, created_at FROM log_pembayaran WHERE pembayaran_id = ? ORDER BY created_at DESC',
      [pembayaran[0].id]
    );

    return reply.send({
      success: true,
      data: { ...pembayaran[0], riwayat_log: logs }
    });

  } catch (error) {
    return reply.status(500).send({ success: false, error: error.message });
  }
}

// --------------------------------------------------------
// 3. Upload Bukti Bayar (PERBAIKAN UTAMA)
// --------------------------------------------------------
async function uploadBuktiBayar(request, reply) {
  try {
    // ✅ GUNAKAN REQUEST.BODY (Karena attachFieldsToBody: true)
    const parts = request.body;
    const file = parts.file; // File objek
    const kodeField = parts.kode_transaksi; // Field text

    if (!file || !kodeField) {
      return reply.status(400).send({ success: false, message: 'File dan Kode Transaksi wajib diisi' });
    }

    const kode = kodeField.value;
    const db = request.server.db;

    // 1. Cek Transaksi
    const [pembayaranResult] = await db.execute(
      'SELECT id, status FROM pembayaran WHERE kode_transaksi = ?',
      [kode]
    );

    if (pembayaranResult.length === 0) {
       return reply.status(404).send({ success: false, message: 'Transaksi tidak ditemukan' });
    }

    const pembayaranId = pembayaranResult[0].id;
    const statusLama = pembayaranResult[0].status;
    const statusBaru = 'menunggu_verifikasi';

    // 2. Simpan File Fisik
    const filename = `bukti-${Date.now()}-${file.filename}`;
    const uploadDir = path.join(__dirname, '../../uploads/bukti-bayar');
    
    // Buat folder jika belum ada
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savePath = path.join(uploadDir, filename);
    fs.writeFileSync(savePath, file._buf); // Tulis buffer ke disk

    // 3. Simpan ke DB (Tabel Gambar)
    const urlGambar = `http://localhost:3000/uploads/bukti-bayar/${filename}`;
    
    const [result] = await db.execute(
      `INSERT INTO gambar (jenis_entitas, entitas_id, url_gambar, nama_file, urutan_tampil, created_at) 
       VALUES ('bukti_bayar', ?, ?, ?, 1, NOW())`,
      [pembayaranId, urlGambar, filename]
    );

    // 4. Update Status Pembayaran
    if (statusLama !== statusBaru) {
        await db.execute('UPDATE pembayaran SET status = ? WHERE id = ?', [statusBaru, pembayaranId]);
        await logPaymentStatus(db, pembayaranId, statusLama, statusBaru, 'Bukti transfer diupload user.', null);
    }

    return reply.send({
      success: true,
      message: 'Bukti pembayaran berhasil diunggah',
      data: { file_id: result.insertId, url: urlGambar }
    });

  } catch (error) {
    request.log.error('Upload Error:', error);
    return reply.status(500).send({ success: false, message: 'Gagal upload bukti', error: error.message });
  }
}

// --------------------------------------------------------
// 4. Handle Webhook
// --------------------------------------------------------
async function handleWebhook(request, reply) {
  const { order_id, transaction_status, payment_type } = request.body;
  
  try {
    const db = request.server.db;
    const [pembayaranResult] = await db.execute(
      'SELECT id, status FROM pembayaran WHERE kode_transaksi = ?',
      [order_id] 
    );

    if (pembayaranResult.length === 0) {
      return reply.status(404).send({ success: false, message: 'Transaction not found' });
    }

    const pembayaranId = pembayaranResult[0].id;
    const statusLama = pembayaranResult[0].status;
    let statusBaru = statusLama;

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      statusBaru = 'berhasil';
    } else if (transaction_status === 'expire' || transaction_status === 'cancel') {
      statusBaru = 'gagal';
    } else if (transaction_status === 'pending') {
      statusBaru = 'menunggu';
    }

    if (statusLama !== statusBaru) {
      await db.execute('UPDATE pembayaran SET status = ? WHERE id = ?', [statusBaru, pembayaranId]);
      await logPaymentStatus(db, pembayaranId, statusLama, statusBaru, `Webhook update: ${payment_type}`, null);
    }

    return reply.send({ success: true, message: 'Webhook processed' });

  } catch (error) {
    return reply.status(500).send({ success: false, message: 'Webhook failed' });
  }
}

module.exports = {
  createPembayaran,
  getPembayaranStatus,
  uploadBuktiBayar,
  handleWebhook
};