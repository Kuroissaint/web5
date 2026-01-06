// HAPUS BARIS INI: const db = require('../config/db');
// Kami berasumsi koneksi database (pool) akan di-inject melalui constructor

class KucingModel {
    // Constructor sekarang HANYA menerima koneksi yang di-inject dari Controller/server.js
    constructor(dbConnection) {
        // Asumsi: 'dbConnection' adalah pool koneksi MySQL yang sudah diinisialisasi di server.js
        this.db = dbConnection;
    }
  
    // =====================================================================
    // BAGIAN 1: KUCING MODEL ORIGINAL (ADOPSI & GENERAL) - PRIORITAS UTAMA
    // =====================================================================
  
    // 1. Fungsi untuk INSERT data kucing baru (Versi Adopsi/Umum)
    async create(data) {
        // Menggunakan this.db.execute
        const [result] = await this.db.execute(
            `INSERT INTO kucing (
                nama_kucing, jenis_kelamin, umur, warna_bulu, deskripsi,
                sudah_steril, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
                data.namaKucing,
                data.jenisKelamin,
                data.usia || data.umur,
                data.warnaBulu,
                data.deskripsi,
                data.sudahSteril
            ]
        );
        return result;
    }
  
    // Fungsi tambah gambar (Original KucingModel)
    async addKucingImage(kucingId, url, filename, connection) {
        // Gunakan connection (untuk transaksi) atau this.db
        const runner = connection || this.db;
        const [result] = await runner.execute(
            `INSERT INTO gambar (entitas_id, jenis_entitas, url_gambar, nama_file)
             VALUES (?, 'kucing', ?, ?)`,
            [kucingId, url, filename]
        );
        return result;
    }
  
    // 2. Fungsi SELECT untuk halaman Adopsi (Original KucingModel)
    async findAll() {
      const [rows] = await this.db.execute(
          `SELECT 
              k.id, k.nama_kucing, k.jenis_kelamin, k.umur, k.warna_bulu, k.deskripsi, k.sudah_steril,
              pa.biaya_adopsi, pa.alamat_lengkap,
              p.nama_provinsi, kk.nama_kabupaten_kota, kc.nama_kecamatan,
              g.url_gambar
              FROM kucing k
              -- Menggunakan JOIN (bisa LEFT atau INNER). 
              -- INNER JOIN memastikan hanya kucing yang punya data 'pengajuan_adopsi' (listing adopsi) yang muncul.
              JOIN pengajuan_adopsi pa on pa.kucing_id = k.id
              LEFT JOIN provinsi p ON pa.provinsi_id = p.id
              LEFT JOIN kabupaten_kota kk ON pa.kabupaten_kota_id = kk.id
              LEFT JOIN kecamatan kc ON pa.kecamatan_id = kc.id
              LEFT JOIN gambar g ON k.id = g.entitas_id AND g.jenis_entitas = 'kucing'
              
              -- ✅ FILTER PENTING:
              -- 1. Status tidak boleh 'hilang' (karena itu untuk fitur Lost & Found)
              -- 2. Status tidak boleh 'teradopsi' (jika sudah laku)
              -- 3. Atau statusnya NULL (biasanya kucing adopsi statusnya NULL atau 'available')
              WHERE (k.status IS NULL OR k.status != 'hilang') 
                AND (k.status != 'teradopsi' OR k.status IS NULL)
              
              GROUP BY k.id -- Mencegah duplikat jika gambar lebih dari satu
              ORDER BY k.created_at DESC`
          );
          return rows;
      }
  
    // 3. Fungsi Detail untuk Adopsi (Original KucingModel - findById)
    async findById(id) {
        const [rows] = await this.db.execute(
            `SELECT 
                k.id, k.nama_kucing, k.umur, k.jenis_kelamin, k.warna_bulu, k.deskripsi, k.sudah_steril,
                pa.alamat_lengkap, pa.biaya_adopsi, pa.telepon as no_telepon_pemilik, pa.nama_lengkap as nama_pemilik,
                p.nama_provinsi, kk.nama_kabupaten_kota, kc.nama_kecamatan,
                g.url_gambar
             FROM kucing k
             LEFT JOIN pengajuan_adopsi pa on pa.kucing_id = k.id
             LEFT JOIN provinsi p ON pa.provinsi_id = p.id
             LEFT JOIN kabupaten_kota kk ON pa.kabupaten_kota_id = kk.id
             LEFT JOIN kecamatan kc ON pa.kecamatan_id = kc.id
             LEFT JOIN gambar g ON k.id = g.entitas_id AND g.jenis_entitas = 'kucing'
             WHERE k.id = ?
             LIMIT 1`,
            [id]
        );
        return rows[0] || null;
    }
  
    async getPengajuanByKucingId(kucing_id, connection) {
        const runner = connection || this.db;
        const [rows] = await runner.execute(
            `SELECT id, biaya_adopsi FROM pengajuan_adopsi WHERE kucing_id = ? LIMIT 1`,
            [kucing_id]
        );
        return rows[0] || null;
    }
  
      async getByUserId(userId) {
          const sql = `
          SELECT 
              k.id, 
              k.nama_kucing, 
              k.status, 
              k.deskripsi, 
              k.created_at,
              -- Mengambil lokasi dari laporan_hilang ( Lost & Found)
              CONCAT(COALESCE(kec.nama_kecamatan, ''), ', ', COALESCE(kab.nama_kabupaten_kota, ''), ', ', COALESCE(p.nama_provinsi, '')) as lokasi_display,
              -- Mengambil foto pertama dari tabel gambar
              (SELECT url_gambar FROM gambar WHERE entitas_id = k.id AND jenis_entitas = 'kucing' LIMIT 1) as foto
          FROM kucing k
          LEFT JOIN laporan_hilang lh ON k.id = lh.kucing_id
          LEFT JOIN provinsi p ON lh.provinsi_id = p.id
          LEFT JOIN kabupaten_kota kab ON lh.kabupaten_kota_id = kab.id
          LEFT JOIN kecamatan kec ON lh.kecamatan_id = kec.id
          WHERE k.pengguna_id = ? 
          ORDER BY k.created_at DESC
          `;
          const [rows] = await this.db.execute(sql, [userId]);
          return rows;
      }
  
    // =====================================================================
    // BAGIAN 2: SEARCH MODEL (PENCARIAN & LAPORAN HILANG)
    // =====================================================================
  
    // ✅ METHOD SEARCH (Untuk halaman Pencarian/Hilang)
    // backend/src/models/KucingModel.js
    async searchKucing(filters = {}) {
        const { keyword, provinsi_id, kota, tags } = filters;
        
        let query = `
        SELECT 
            k.id, k.nama_kucing, k.status, k.deskripsi, k.created_at,
            jk.nama_jenis as jenis_kucing,
            GROUP_CONCAT(DISTINCT t.nama_tag) as tags,
            (SELECT url_gambar FROM gambar WHERE entitas_id = k.id AND jenis_entitas = 'kucing' LIMIT 1) as foto,
            CONCAT(COALESCE(kec.nama_kecamatan, ''), ', ', COALESCE(kab.nama_kabupaten_kota, ''), ', ', COALESCE(p.nama_provinsi, '')) as lokasi_display
        FROM kucing k
        LEFT JOIN laporan_hilang lh ON k.id = lh.kucing_id
        LEFT JOIN provinsi p ON lh.provinsi_id = p.id
        LEFT JOIN kabupaten_kota kab ON lh.kabupaten_kota_id = kab.id
        LEFT JOIN kecamatan kec ON lh.kecamatan_id = kec.id
        LEFT JOIN jenis_kucing jk ON k.jenis_kucing_id = jk.id
        LEFT JOIN tag_kucing tk ON k.id = tk.kucing_id  
        LEFT JOIN tag t ON tk.tag_id = t.id
        WHERE k.status = 'hilang'
        `;
        
        const params = [];

        if (keyword) {
            query += ' AND (k.nama_kucing LIKE ? OR k.deskripsi LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }
        if (provinsi_id) {
            query += ' AND lh.provinsi_id = ?';
            params.push(provinsi_id);
        }
        if (status) {
            query += ` AND k.status = ?`; // 'hilang' atau 'adopsi'
            params.push(status);
        }
        if (kota) {
            query += ' AND kab.nama_kabupaten_kota LIKE ?';
            params.push(`%${kota}%`);
        }
        if (tags && tags.length > 0) {
            const tagArray = Array.isArray(tags) ? tags : [tags];
            query += ` AND k.id IN (
                SELECT tk2.kucing_id FROM tag_kucing tk2 
                JOIN tag t2 ON tk2.tag_id = t2.id 
                WHERE t2.nama_tag IN (${tagArray.map(() => '?').join(',')})
            )`;
            params.push(...tagArray);
        }

        query += ' GROUP BY k.id ORDER BY k.created_at DESC';
        const [rows] = await this.db.execute(query, params);
        return rows;
    }
  
    async getAll() {
        const [rows] = await this.db.execute(`SELECT * FROM kucing`);
        return rows;
    }
  
    async getAllTags() { 
        const [rows] = await this.db.execute('SELECT * FROM tag ORDER BY kategori DESC, nama_tag ASC');
        return rows;
    }
    
    // backend/src/models/KucingModel.js
    async getAllJenis() {
        const [rows] = await this.db.execute('SELECT id, nama_jenis FROM jenis_kucing ORDER BY nama_jenis ASC');
        return rows;
    }


    // ✅ Get Detail (Versi Search/Hilang - Beda dengan findById di atas)
    async getById(id) {
        const [rows] = await this.db.execute(`
            SELECT 
              k.*, jk.nama_jenis as jenis_kucing, GROUP_CONCAT(DISTINCT t.nama_tag) as tags,
              GROUP_CONCAT(DISTINCT g.url_gambar) as list_foto_url,
              lh.nama_pelapor, lh.telepon as kontak_pelapor, lh.waktu_hilang, lh.lokasi_terakhir,
              CONCAT(COALESCE(kec.nama_kecamatan, ''), ', ', COALESCE(kab.nama_kabupaten_kota, ''), ', ', COALESCE(p.nama_provinsi, ''), ' - ', COALESCE(lh.lokasi_terakhir, '')) as lokasi_display
            FROM kucing k
            LEFT JOIN laporan_hilang lh ON k.id = lh.kucing_id
            LEFT JOIN provinsi p ON lh.provinsi_id = p.id
            LEFT JOIN kabupaten_kota kab ON lh.kabupaten_kota_id = kab.id
            LEFT JOIN kecamatan kec ON lh.kecamatan_id = kec.id
            LEFT JOIN jenis_kucing jk ON k.jenis_kucing_id = jk.id
            LEFT JOIN tag_kucing tk ON k.id = tk.kucing_id  
            LEFT JOIN tag t ON tk.tag_id = t.id
            LEFT JOIN gambar g ON k.id = g.entitas_id AND g.jenis_entitas = 'kucing'
            WHERE k.id = ? GROUP BY k.id
          `, [id]);
          return rows[0];
    }
  
    // ✅ METHOD CREATE LAPORAN HILANG (TRANSACTION)
      async createLaporan(data) {
          let connection; 
          try {
              connection = await this.db.getConnection();
              await connection.beginTransaction();
  
              let jenisKucingId = null;
              if (data.ras) {
                  const [jenisRows] = await connection.execute(
                      'SELECT id FROM jenis_kucing WHERE nama_jenis = ?', [data.ras]
                  );
                  if (jenisRows.length > 0) jenisKucingId = jenisRows[0].id;
              }
  
              // 1. INSERT KUCING (WAJIB masukkan pengguna_id/dibuat_oleh)
              const [kucingResult] = await connection.execute(
                  `INSERT INTO kucing (nama_kucing, jenis_kucing_id, deskripsi, status, pengguna_id, created_at) 
                  VALUES (?, ?, ?, 'hilang', ?, NOW())`, // Sesuaikan nama kolom (pengguna_id / dibuat_oleh)
                  [data.nama_kucing, jenisKucingId, data.deskripsi, data.pengguna_id]
              );
              const newKucingId = kucingResult.insertId;
  
              // 2. INSERT LAPORAN HILANG (WAJIB masukkan pengguna_id)
              await connection.execute(
                  `INSERT INTO laporan_hilang (
                  kucing_id, pengguna_id, nama_pelapor, telepon, waktu_hilang, 
                  lokasi_terakhir, provinsi_id, kabupaten_kota_id, kecamatan_id, 
                  deskripsi, status, created_at
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'hilang', NOW())`,
                  [
                      newKucingId, data.pengguna_id, data.nama_pelapor, data.telepon, 
                      data.waktu_hilang, data.lokasi, data.provinsi_id, 
                      data.kabupaten_kota_id, data.kecamatan_id, data.deskripsi
                  ]
              );
  
              // 3. INSERT TAGS (Sudah benar)
              if (data.tags && data.tags.length > 0) {
                  for (const tagName of data.tags) {
                      const [tagRows] = await connection.execute('SELECT id FROM tag WHERE nama_tag = ?', [tagName]);
                      if (tagRows.length > 0) {
                          await connection.execute(
                              'INSERT INTO tag_kucing (kucing_id, tag_id, created_at) VALUES (?, ?, NOW())',
                              [newKucingId, tagRows[0].id]
                          );
                      }
                  }
              }
  
              // 4. INSERT BANYAK GAMBAR (Sudah benar)
              if (data.fotos && data.fotos.length > 0) {
                  for (const filename of data.fotos) {
                      const urlGambar = `/uploads/${filename}`;
                      await connection.execute(
                          `INSERT INTO gambar (jenis_entitas, entitas_id, url_gambar, nama_file, created_at) 
                          VALUES ('kucing', ?, ?, ?, NOW())`,
                          [newKucingId, urlGambar, filename]
                      );
                  }
              }
  
              await connection.commit();
              return newKucingId;
  
          } catch (error) {
              if (connection) await connection.rollback();
              throw error;
          } finally {
              if (connection) connection.release();
          }
      }
  
    // =====================================================================
    // BAGIAN 3: RESCUE MODEL
    // =====================================================================
  
    // Search Rescue
    async searchRescue(filters = {}) {
        const { ids } = filters;
        let query = `
        SELECT 
            lr.id, lr.nama_pelapor, lr.telepon, lr.waktu_penemuan,
            lr.lokasi_penemuan, lr.deskripsi, lr.status, lr.created_at,
            COALESCE(k.status, 'Sedang Diproses') AS status_display,
            COALESCE(jk.nama_jenis, 'Tidak diketahui') AS ras_kucing,
            (SELECT url_gambar FROM gambar WHERE entitas_id = lr.id AND jenis_entitas = 'laporan_rescue' LIMIT 1) AS url_gambar_utama,
            (SELECT t.nama_tag FROM tag t JOIN tag_kucing tk ON tk.tag_id = t.id WHERE tk.kucing_id = lr.kucing_id LIMIT 1) AS tags
        FROM laporan_rescue lr
        LEFT JOIN kucing k ON lr.kucing_id = k.id
        LEFT JOIN jenis_kucing jk ON k.jenis_kucing_id = jk.id
        WHERE 1=1
        `;
  
        const params = [];
        if (ids && Array.isArray(ids) && ids.length > 0) {
            const placeholders = ids.map(() => '?').join(',');
            query += ` AND lr.id IN (${placeholders})`;
            params.push(...ids);
        }
        query += ' GROUP BY lr.id ORDER BY lr.created_at DESC';
  
        try {
            const [rows] = await this.db.execute(query, params);
            rows.forEach(r => {
                // Perlu didefinisikan process.env.BASE_URL di environment
                r.gambar = r.url_gambar_utama ? `${process.env.BASE_URL}${r.url_gambar_utama}` : null;
                r.status_display = r.status || "Sedang Diproses";
                r.tags = r.tags || "-";
            });
            return rows;
        } catch (error) {
            console.error("❌ SQL Error di searchRescue:", error);
            throw error;
        }
    }
  
    // Create Kucing (Versi Rescue)
    async createKucing(data) {
        const sql = `
          INSERT INTO kucing
            (nama_kucing, jenis_kucing_id, jenis_kelamin, tanggal_lahir, warna_bulu, deskripsi, sudah_steril, status, pengguna_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.nama_kucing, data.jenis_kucing_id, data.jenis_kelamin, data.tanggal_lahir,
            data.warna_bulu, data.deskripsi, data.sudah_steril, data.status,
            data.pengguna_id, data.created_at, data.updated_at
        ];
        const [result] = await this.db.execute(sql, params);
        return result.insertId;
    }
  
    // Create Laporan Rescue (Nama diubah dari 'create' menjadi 'createRescue' untuk menghindari bentrok)
    async createRescue(data) {
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
  
  module.exports = KucingModel;