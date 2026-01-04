// backend/src/models/PembayaranModel.js

class PembayaranModel {
    // ✅ Tambahkan Constructor untuk Dependency Injection
    constructor(db) {
        this.db = db;
    }
    
    static async create(data, connection) {
        const query = `
            INSERT INTO pembayaran (
                pengguna_id, jenis_transaksi, metode_bayar, jumlah,
                status, kode_transaksi, url_pembayaran
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.query(query, [
            data.pengguna_id,
            data.jenis_transaksi,
            data.metode_bayar, // ✅ PERBAIKAN URUTAN
            data.jumlah,       // ✅ PERBAIKAN URUTAN
            data.status, 
            data.kode_transaksi,
            data.url_pembayaran
        ]);
        return result;
    }
};

module.exports = PembayaranModel;