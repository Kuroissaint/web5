// backend/src/models/TransaksiAdopsiModel.js

class TransaksiAdopsiModel {
  // ✅ Tambahkan Constructor untuk Dependency Injection
  constructor(db) {
      this.db = db;
  }
  
  static async create(data, connection) {
      const query = `
        INSERT INTO transaksi_adopsi (
            aplikasi_adopsi_id, bukti_transfer, status_pembayaran
        )
        VALUES (?, ?, ?)
      `;

      const [result] = await connection.query(
        query,
        [
          data.aplikasi_adopsi_id,
          data.bukti_transfer,
          data.status_pembayaran,
        ]
      );
      return result;
  }
}

module.exports = TransaksiAdopsiModel;