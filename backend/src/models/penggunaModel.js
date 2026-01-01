
class PenggunaModel {
    // 1. Terima koneksi DB melalui constructor
    constructor(db) {
        this.db = db;
    }

    // 2. Ubah dari static method menjadi instance method
    async getById(id) {
        // Gunakan this.db.execute (atau query)
        const [rows] = await this.db.execute(
            `SELECT id, username, email, provinsi_id, foto_profil 
             FROM pengguna WHERE id = ?`,
            [id]
        );
        return rows[0];
    }
    
    // Anda bisa menambahkan method lain di sini (misal: create, update, findByEmail)
}

module.exports = PenggunaModel;