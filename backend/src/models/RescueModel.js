// src/models/RescueModel.js

// HAPUS BARIS INI: const pool = require('../config/db');

class RescueModel {
  constructor(db) {
    this.db = db;
  }

  // ============================================
  // SEARCH RESCUE (SUDAH FIX TANPA UBAH STRUKTUR)
  // ============================================
  async searchRescue(filters = {}) {
    const { ids, status } = filters;

    let query = `
    SELECT 
        lr.id,
        lr.nama_pelapor,
        lr.telepon,
        lr.waktu_penemuan,
        lr.lokasi_penemuan,
        lr.deskripsi,
        lr.status,
        lr.created_at,

        COALESCE(k.status, 'Sedang Diproses') AS status_display,
        COALESCE(jk.nama_jenis, 'Tidak diketahui') AS ras_kucing,
        
        -- ✅ MENGGUNAKAN JOIN UNTUK AGGREGASI TAGS
        GROUP_CONCAT(DISTINCT t.nama_tag) AS tags,

        -- Ambil Gambar Pertama (Subquery tetap dipertahankan)
        (SELECT url_gambar FROM gambar
         WHERE entitas_id = lr.id AND jenis_entitas = 'laporan_rescue'
         ORDER BY created_at ASC LIMIT 1) AS url_gambar_utama

    FROM laporan_rescue lr
    -- JOIN ke tabel Kucing dan Jenis Kucing
    LEFT JOIN kucing k ON lr.kucing_id = k.id
    LEFT JOIN jenis_kucing jk ON k.jenis_kucing_id = jk.id
    -- JOIN ke tabel Tag
    LEFT JOIN tag_kucing tk ON k.id = tk.kucing_id 
    LEFT JOIN tag t ON tk.tag_id = t.id
    
    WHERE 1=1
    `;

    const params = [];

    if (ids && Array.isArray(ids) && ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      query += ` AND lr.id IN (${placeholders})`;
      params.push(...ids);
    }
    
    // ✅ GROUP BY KUNCI UTAMA LAPORAN UNTUK AGGREGASI TAGS
    query += ' GROUP BY lr.id ORDER BY lr.created_at DESC'; 

    console.log("==========================================");
    console.log("🚨 DEBUG QUERY RESCUE PAGE (FINAL):");
    console.log("Query SQL:", query);
    console.log("Parameters:", params);
    console.log("==========================================");

    try {
      const [rows] = await this.db.execute(query, params); 

   rows.forEach(r => {
      // ✅ FORMATTING ULANG GAMBAR
      // Pastikan process.env.BASE_URL disetel (misal: http://localhost:3000)
      r.gambar = r.url_gambar_utama 
        ? `${process.env.BASE_URL}${r.url_gambar_utama}`
        : null;

      r.status_display = r.status || "Sedang Diproses";
      r.status = r.status_display;
      r.tags = r.tags || "Lainnya";
    });

    console.log("✅ DEBUG RESULT COUNT:", rows.length);
    return rows;

    } catch (error) {
      console.error("❌ SQL Error di searchRescue:", error);
      throw error;
    }
  }

  async getById(id) {
    let query = `
    SELECT 
        lr.*, -- Ambil semua kolom dari laporan_rescue
        k.jenis_kucing_id, 
        k.deskripsi as deskripsi_kucing,
        COALESCE(k.status, 'Sedang Diproses') AS status_display,
        
        -- Ambil Gambar Pertama (Subquery)
        (SELECT url_gambar FROM gambar
         WHERE entitas_id = lr.id AND jenis_entitas = 'laporan_rescue'
         ORDER BY created_at ASC LIMIT 1) AS url_gambar_utama,
         
        -- Ambil Tags (Subquery)
        (SELECT GROUP_CONCAT(t.nama_tag)
         FROM tag_kucing tk JOIN tag t ON tk.tag_id = t.id
         WHERE tk.kucing_id = k.id) AS tags

    FROM laporan_rescue lr
    LEFT JOIN kucing k ON lr.kucing_id = k.id
    
    WHERE lr.id = ?
    LIMIT 1
    `;

    try {
      const [rows] = await this.db.execute(query, [id]); 
      
      console.log("DEBUG MODEL: getById executed for ID:", id);
      console.log("DEBUG MODEL: Resulting rows length:", rows.length);
      
      if (rows.length > 0) {
        const r = rows[0];
        // Format Output (Pastikan format yang sama dengan searchRescue)
        r.gambar = r.url_gambar_utama 
          ? `${process.env.BASE_URL}${r.url_gambar_utama}`
          : null;
        r.status_display = r.status || r.status_display; // Gunakan status dari query
        r.tags = r.tags || "Lainnya";
        return r; 
      }
      return null;
    } catch (error) {
      console.error("❌ SQL Error di getById:", error);
      throw error;
    }
}
  // ============================================
  // CREATE KUCING (TIDAK DIUBAH)
  // ============================================
  async createKucing(data) {
    const sql = `
      INSERT INTO kucing
        (nama_kucing, jenis_kucing_id, jenis_kelamin, warna_bulu, deskripsi, sudah_steril, status, dibuat_oleh, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.nama_kucing,
      data.jenis_kucing_id, // ✅ Kolom ke-2
      data.jenis_kelamin,   // ✅ Kolom ke-3
      data.warna_bulu,
      data.deskripsi,
      data.sudah_steril,
      data.status,
      data.dibuat_oleh,
      data.created_at,
      data.updated_at
    ];
    // Query sekarang hanya memiliki 10 field dan 10 placeholder
    const [result] = await this.db.execute(sql, params);
    return result.insertId;
  }

  // ============================================
  // CREATE RESCUE (SUDAH DIBENERIN PARAMETER)
  // ============================================
  async create(data) {
    const sql = `
      INSERT INTO laporan_rescue
      (nama_pelapor, telepon, lokasi_penemuan, deskripsi, pengguna_id, kucing_id, waktu_penemuan, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute(sql, [
      data.nama_pelapor,
      data.telepon,
      data.lokasi_penemuan,
      data.deskripsi || null,
      data.pengguna_id || null,
      data.kucing_id,
      data.waktu_penemuan,
      data.status || 'dilaporkan'
    ]);
    return result.insertId;
  }

  // ============================================
  // UPDATE STATUS (TIDAK DIUBAH)
  // ============================================
  async updateStatus(id, status) {
    await this.db.execute(
      'UPDATE laporan_rescue SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  // ============================================
  // DELETE RESCUE (TIDAK DIUBAH)
  // ============================================
  async delete(id) {
    await this.db.execute(
      'DELETE FROM laporan_rescue WHERE id = ?',
      [id]
    );
  }

  // ============================================
  // ADD TAG KUCING (TIDAK DIUBAH)
  // ============================================
  async addTagKucing(data) {
    const sql = `INSERT INTO tag_kucing (kucing_id, tag_id, created_at)
                 VALUES (?, ?, ?)`;
    const [result] = await this.db.execute(sql, [
      data.kucing_id,
      data.tag_id,
      data.created_at
    ]);
    return result.insertId;
  }

}

module.exports = RescueModel;