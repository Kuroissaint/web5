// filepath: /home/wment/meowment/backend/src/controllers/DonasiController.js

// Create new donation
async function createDonasi(request, reply) {
  const { pengguna_id, nominal, frekuensi, pesan_dukungan } = request.body;
  
  try {
    const db = request.server.db;
    
    // Insert donation record
    const [result] = await db.execute(
      `INSERT INTO donasi 
       (pengguna_id, nominal, frekuensi, pesan_dukungan) 
       VALUES (?, ?, ?, ?)`,
      [pengguna_id, nominal, frekuensi, pesan_dukungan || null]
    );

    // Get the created donation
    const [donations] = await db.execute(
      'SELECT * FROM donasi WHERE id = ?',
      [result.insertId]
    );

    return reply.send({
      success: true,
      message: 'Donation created successfully',
      data: donations[0]
    });

  } catch (error) {
    request.log.error('Error creating donation:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to create donation',
      error: error.message
    });
  }
}

// Get donations by user
async function getDonasiByUser(request, reply) {
  const { pengguna_id } = request.params;
  
  try {
    const db = request.server.db;
    
    const [donations] = await db.execute(
      `SELECT d.*, p.status as status_pembayaran, p.kode_transaksi
       FROM donasi d
       LEFT JOIN pembayaran p ON d.id = p.transaksi_id AND p.jenis_transaksi = 'donasi'
       WHERE d.pengguna_id = ?
       ORDER BY d.created_at DESC`,
      [pengguna_id]
    );

    return reply.send({
      success: true,
      data: donations
    });

  } catch (error) {
    request.log.error('Error fetching user donations:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to fetch donations',
      error: error.message
    });
  }
}

// Get donation by ID
async function getDonasiById(request, reply) {
  const { id } = request.params;
  
  try {
    const db = request.server.db;
    
    const [donations] = await db.execute(
      `SELECT d.*, p.status as status_pembayaran, p.kode_transaksi, p.metode_bayar
       FROM donasi d
       LEFT JOIN pembayaran p ON d.id = p.transaksi_id AND p.jenis_transaksi = 'donasi'
       WHERE d.id = ?`,
      [id]
    );

    if (donations.length === 0) {
      return reply.status(404).send({
        success: false,
        message: 'Donation not found'
      });
    }

    return reply.send({
      success: true,
      data: donations[0]
    });

  } catch (error) {
    request.log.error('Error fetching donation:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to fetch donation',
      error: error.message
    });
  }
}

// Get donation statistics
async function getDonasiStats(request, reply) {
  try {
    const db = request.server.db;
    
    // Total donations
    const [totalResult] = await db.execute(
      `SELECT 
        COUNT(*) as total_donasi,
        SUM(nominal) as total_nominal,
        AVG(nominal) as rata_rata
       FROM donasi d
       JOIN pembayaran p ON d.id = p.transaksi_id 
       WHERE p.status = 'berhasil'`
    );

    // Monthly donations
    const [monthlyResult] = await db.execute(
      `SELECT 
        DATE_FORMAT(d.created_at, '%Y-%m') as bulan,
        COUNT(*) as jumlah_donasi,
        SUM(d.nominal) as total_bulanan
       FROM donasi d
       JOIN pembayaran p ON d.id = p.transaksi_id 
       WHERE p.status = 'berhasil'
       GROUP BY DATE_FORMAT(d.created_at, '%Y-%m')
       ORDER BY bulan DESC
       LIMIT 6`
    );

    return reply.send({
      success: true,
      data: {
        total: totalResult[0],
        monthly: monthlyResult
      }
    });

  } catch (error) {
    request.log.error('Error fetching donation stats:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to fetch donation statistics',
      error: error.message
    });
  }
}

// Update donation (for admin)
async function updateDonasi(request, reply) {
  const { id } = request.params;
  const { nominal, frekuensi, pesan_dukungan } = request.body;
  
  try {
    const db = request.server.db;
    
    const [result] = await db.execute(
      `UPDATE donasi 
       SET nominal = COALESCE(?, nominal),
           frekuensi = COALESCE(?, frekuensi),
           pesan_dukungan = COALESCE(?, pesan_dukungan)
       WHERE id = ?`,
      [nominal, frekuensi, pesan_dukungan, id]
    );

    if (result.affectedRows === 0) {
      return reply.status(404).send({
        success: false,
        message: 'Donation not found'
      });
    }

    // Get updated donation
    const [donations] = await db.execute(
      'SELECT * FROM donasi WHERE id = ?',
      [id]
    );

    return reply.send({
      success: true,
      message: 'Donation updated successfully',
      data: donations[0]
    });

  } catch (error) {
    request.log.error('Error updating donation:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to update donation',
      error: error.message
    });
  }
}

module.exports = {
  createDonasi,
  getDonasiByUser,
  getDonasiById,
  getDonasiStats,
  updateDonasi
};