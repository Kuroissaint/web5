
class PengajuanAdopsiModel {
  // 1. Terima koneksi DB melalui constructor
  constructor(db) {
      this.db = db;
  }

  // 2. FUNGSI CREATE (Untuk transaksi, menerima 'connection')
  async create(data, connection) { 
      // PASTIKAN runner adalah 'connection'
      const runner = connection; 
      
      const query = `
        INSERT INTO pengajuan_adopsi
        (pengguna_id, kucing_id, nama_lengkap, telepon, provinsi_id, kabupaten_kota_id, kecamatan_id, alamat_lengkap) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `; 
      
      // PENTING: Gunakan runner.query (bukan runner.execute jika Anda menggunakan mysql2/promise)
      const [result] = await runner.query( 
        query,
        [
          data.pengguna_id,
          data.kucing_id,
          data.nama_lengkap,
          data.telepon,
          data.provinsi_id,
          data.kabupaten_kota_id,
          data.kecamatan_id,
          data.alamat_lengkap,

        ]
      );
      return result;
  }
  
  // 3. FUNGSI getPengajuanByKucingId (Helper untuk transaksi)
  async getPengajuanByKucingId(kucingId, connection) { 
      // PASTIKAN runner adalah 'connection'
      const runner = connection; 
      
      const query = `
          SELECT id
          FROM pengajuan_adopsi 
          WHERE kucing_id = ? 
          LIMIT 1
      `;
      // PENTING: Gunakan runner.query (bukan runner.execute jika Anda menggunakan mysql2/promise)
      const [rows] = await runner.query(query, [kucingId]);
      
      return rows[0] || null;
  }

  
  // 4. FUNGSI getByUserId (Diubah ke async/await, menggunakan this.db)
  async getByUserId(pengguna_id) { 
      // Menggunakan this.db karena ini BUKAN bagian dari transaksi POST
      const [rows] = await this.db.execute( 
        "SELECT * FROM pengajuan_adopsi WHERE pengguna_id = ?",
        [pengguna_id]
      );
      return rows;
  }

  async getAll() {
       const [rows] = await this.db.execute("SELECT * FROM pengajuan_adopsi ORDER BY created_at DESC");
       return rows;
  }
  
  async getById(id) {
       const [rows] = await this.db.execute("SELECT * FROM pengajuan_adopsi WHERE id = ?", [id]);
       return rows[0] || null;
  }
  
  async updateStatus(id, status) {
       const [result] = await this.db.execute(
           "UPDATE pengajuan_adopsi SET status_pengajuan = ?, updated_at = NOW() WHERE id = ?",
           [status, id]
       );
       return result;
  }
}

module.exports = PengajuanAdopsiModel;