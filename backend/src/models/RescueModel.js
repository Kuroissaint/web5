class RescueModel {
  constructor(db) {
    this.db = db;
  }

  // =================================================================
  // 1. SEARCH RESCUE (DENGAN FILTER pengguna_id & FIX STATUS)
  // =================================================================
  async searchRescue(filters = {}) {
    const { ids, status, pengguna_id } = filters;

    let query = `
    SELECT 
        lr.id,
        lr.nama_pelapor,
        lr.telepon,
        lr.waktu_penemuan,
        lr.lokasi_penemuan,
        lr.deskripsi,
        lr.status, -- Status asli dari laporan_rescue
        lr.created_at,
        lr.pengguna_id,

        -- ✅ Gunakan lr.status untuk sinkronisasi tracker di Frontend
        lr.status AS status_display, 
        COALESCE(jk.nama_jenis, 'Tidak diketahui') AS ras_kucing,
        
        -- ✅ Aggregasi Tags
        GROUP_CONCAT(DISTINCT t.nama_tag) AS tags,

        -- Ambil Gambar Pertama
        (SELECT url_gambar FROM gambar
         WHERE entitas_id = lr.id AND jenis_entitas = 'laporan_rescue'
         ORDER BY created_at ASC LIMIT 1) AS url_gambar_utama

    FROM laporan_rescue lr
    LEFT JOIN kucing k ON lr.kucing_id = k.id
    LEFT JOIN jenis_kucing jk ON k.jenis_kucing_id = jk.id
    LEFT JOIN tag_kucing tk ON k.id = tk.kucing_id 
    LEFT JOIN tag t ON tk.tag_id = t.id
    
    WHERE 1=1
    `;

    const params = [];

    // Filter berdasarkan list ID (jika ada)
    if (ids && Array.isArray(ids) && ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      query += ` AND lr.id IN (${placeholders})`;
      params.push(...ids);
    }

    // ✅ FILTER BARU: Berdasarkan pengguna_id (Untuk halaman my-report)
    if (pengguna_id) {
      query += ` AND lr.pengguna_id = ?`;
      params.push(pengguna_id);
    }

    // Filter status (jika ada)
    if (status) {
      query += ` AND lr.status = ?`;
      params.push(status);
    }
    
    query += ' GROUP BY lr.id ORDER BY lr.created_at DESC'; 

    try {
      const [rows] = await this.db.execute(query, params); 

      rows.forEach(r => {
        // Formatting URL Gambar
        r.gambar = r.url_gambar_utama 
          ? (r.url_gambar_utama.startsWith('http') ? r.url_gambar_utama : `${process.env.BASE_URL}${r.url_gambar_utama}`)
          : null;

        // Memastikan status default jika data kosong
        r.status_display = r.status_display || "dilaporkan";
        r.tags = r.tags || "Umum";
      });

      return rows;
    } catch (error) {
      console.error("❌ SQL Error di searchRescue:", error);
      throw error;
    }
  }

  // =================================================================
  // 2. GET BY ID (FIX STATUS DISPLAY)
  // =================================================================
  async getById(id) {
    let query = `
    SELECT 
        lr.*,
        lr.status AS status_display, -- Konsisten dengan searchRescue
        k.jenis_kucing_id, 
        k.deskripsi as deskripsi_kucing,
        (SELECT url_gambar FROM gambar
         WHERE entitas_id = lr.id AND jenis_entitas = 'laporan_rescue'
         ORDER BY created_at ASC LIMIT 1) AS url_gambar_utama,
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
      if (rows.length > 0) {
        const r = rows[0];
        r.gambar = r.url_gambar_utama ? `${process.env.BASE_URL}${r.url_gambar_utama}` : null;
        r.tags = r.tags || "Umum";
        return r; 
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // =================================================================
  // 3. CREATE KUCING (UPDATE: pengguna_id & kategori='rescue')
  // =================================================================
  async createKucing(data) {
    const sql = `
      INSERT INTO kucing
        (nama_kucing, jenis_kucing_id, jenis_kelamin, warna_bulu, deskripsi, sudah_steril, status, pengguna_id, kategori, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'rescue', ?, ?)
    `;
    const params = [
      data.nama_kucing || "Tidak Diketahui",
      data.jenis_kucing_id || null,
      data.jenis_kelamin || null,
      data.warna_bulu || null,
      data.deskripsi || null,
      data.sudah_steril || 0,
      data.status || 'liar',
      data.pengguna_id || null, // Diubah dari dibuat_oleh
      data.created_at || new Date(),
      data.updated_at || new Date()
    ];
    const [result] = await this.db.execute(sql, params);
    return result.insertId;
  }

  // =================================================================
  // 4. CREATE REPORT (SUDAH DIBENERIN)
  // =================================================================
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

  async updateStatus(id, status) {
    await this.db.execute('UPDATE laporan_rescue SET status = ? WHERE id = ?', [status, id]);
  }

  async delete(id) {
    await this.db.execute('DELETE FROM laporan_rescue WHERE id = ?', [id]);
  }

  async addTagKucing(data) {
    const sql = `INSERT INTO tag_kucing (kucing_id, tag_id, created_at) VALUES (?, ?, ?)`;
    const [result] = await this.db.execute(sql, [data.kucing_id, data.tag_id, data.created_at]);
    return result.insertId;
  }
}

module.exports = RescueModel;