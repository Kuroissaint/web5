class AplikasiAdopsiModel {
  constructor(db) {
      this.db = db;
  }

  async getEmailPengguna(id) {
      const [rows] = await this.db.execute('SELECT email FROM pengguna WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0].email : null;
  }

  // ✅ PERBAIKAN UTAMA DI SINI: Pastikan urutan kolom dan values sinkron
  static async create(data, connection) {
      const runner = connection; // Menggunakan koneksi transaksi

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
          data.provinsi_id,       // Pastikan ini urutan ke-10
          data.kabupaten_kota_id, // Pastikan ini urutan ke-11
          data.kecamatan_id       // Pastikan ini urutan ke-12
      ];

      // Debugging (Opsional: bisa dihapus nanti)
      console.log("Mencoba Insert Aplikasi dengan Data:", values);

      const [result] = await runner.execute(query, values);
      return result;
  }
}

module.exports = AplikasiAdopsiModel;