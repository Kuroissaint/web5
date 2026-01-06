// backend/src/models/aplikasiAdopsiModel.js

class AplikasiAdopsiModel {
  constructor(db) {
      this.db = db;
  }

  // Fungsi untuk mengambil email (bisa dipakai untuk fitur notifikasi nantinya)
  async getEmailPengguna(id) {
      const [rows] = await this.db.execute('SELECT email FROM pengguna WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0].email : null;
  }

  /* Mengambil daftar kucing yang dilamar oleh user tertentu (Adopsi Saya)
     */
    // backend/src/models/aplikasiAdopsiModel.js

    async getByUserId(userId) {
        const query = `
            SELECT 
                a.id, 
                a.status AS status_adopsi, -- Beri alias agar tidak bingung dengan status kucing
                a.created_at,
                k.nama_kucing,
                (SELECT g.url_gambar 
                FROM gambar g 
                WHERE g.jenis_entitas = 'kucing' 
                AND g.entitas_id = k.id 
                LIMIT 1) as url_gambar
            FROM aplikasi_adopsi a
            LEFT JOIN kucing k ON a.kucing_id = k.id -- GUNAKAN LEFT JOIN
            WHERE a.pengguna_id = ?
            ORDER BY a.id DESC
        `;

        
        try {
            const [rows] = await this.db.execute(query, [userId]);
           console.log("DEBUG: Data ditemukan di DB:", rows.length, "baris untuk UserID:", userId);
            return rows;
        } catch (error) {
            console.error("Query Error di getByUserId:", error);
            throw error;
        }
    }


  /**
   * Fungsi utama untuk menyimpan data formulir adopsi
   * @param {Object} data - Data dari controller
   * @param {Object} connection - Koneksi database (untuk transaksi)
   */
  static async create(data, connection) {
      const runner = connection; 

      const query = `
          INSERT INTO aplikasi_adopsi (
              pengguna_id, 
              kucing_id, 
              nama_lengkap, 
              umur, 
              telepon, 
              alamat_lengkap, 
              pekerjaan, 
              pernah_pelihara_kucing, 
              alasan_adopsi, 
              provinsi_id, 
              kabupaten_kota_id, 
              kecamatan_id,
              status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `;

      const values = [
          data.pengguna_id,
          data.kucing_id,
          data.nama_lengkap,
          data.umur,
          data.telepon,
          data.alamat_lengkap,
          data.pekerjaan,
          data.pernah_pelihara_kucing,
          data.alasan_adopsi,
          data.provinsi_id,       // Urutan ke-10
          data.kabupaten_kota_id, // Urutan ke-11
          data.kecamatan_id       // Urutan ke-12
      ];

      // Melakukan eksekusi query
      const [result] = await runner.execute(query, values);
      return result;
  }
}

module.exports = AplikasiAdopsiModel;