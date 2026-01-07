
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

    async update(userId, data) {
        const fields = [];
        const values = [];

        // Dinamis: hanya update kolom yang dikirim
        if (data.nama) { fields.push("nama = ?"); values.push(data.nama); }
        if (data.email) { fields.push("email = ?"); values.push(data.email); }
        if (data.no_hp) { fields.push("no_hp = ?"); values.push(data.no_hp); }
        if (data.foto) { fields.push("foto = ?"); values.push(data.foto); }
        if (data.alamat) { fields.push("alamat = ?"); values.push(data.alamat); }

        if (fields.length === 0) return null;

        values.push(userId);
        const query = `UPDATE pengguna SET ${fields.join(", ")} WHERE id = ?`;
        const [result] = await this.db.execute(query, values);
        return result;
    }
}

module.exports = PenggunaModel;