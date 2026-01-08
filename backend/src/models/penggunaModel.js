
class PenggunaModel {
    // 1. Terima koneksi DB melalui constructor
    constructor(db) {
        this.db = db;
    }

    // 2. Ubah dari static method menjadi instance method
    async getById(id) {
        const [rows] = await this.db.execute(
            `SELECT id, username, email, status, provinsi_id, foto_profil AS foto, 
                    deskripsi_shelter, qr_donasi, no_hp, alamat 
             FROM pengguna WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    // Fungsi Baru: Untuk mengambil statistik user biasa
    async getStats(userId) {
        try {
            // 1. Hitung jumlah laporan rescue
            const [rescueCount] = await this.db.execute(
                "SELECT COUNT(*) as total FROM laporan_rescue WHERE pengguna_id = ?", 
                [userId]
            );
            
            // 2. Hitung total nominal donasi yang statusnya sudah 'verified' (asumsi ada kolom status)
            const [donationSum] = await this.db.execute(
                "SELECT SUM(nominal) as total FROM donasi WHERE donatur_id = ? AND status = 'verified'",
                [userId]
            );

            return {
                totalRescue: rescueCount[0].total || 0,
                totalDonasi: donationSum[0].total || 0
            };
        } catch (error) {
            throw new Error("Gagal mengambil statistik: " + error.message);
        }
    }

    async update(userId, data) {
        const fields = [];
        const values = [];

        // Tambahkan kolom baru ke logika update dinamis
        if (data.username) { fields.push("username = ?"); values.push(data.username); }
        if (data.email) { fields.push("email = ?"); values.push(data.email); }
        if (data.no_hp) { fields.push("no_hp = ?"); values.push(data.no_hp); }
        if (data.foto) { fields.push("foto_profil = ?"); values.push(data.foto); }
        if (data.alamat) { fields.push("alamat = ?"); values.push(data.alamat); }
        if (data.deskripsi_shelter) { fields.push("deskripsi_shelter = ?"); values.push(data.deskripsi_shelter); }
        if (data.qr_donasi) { fields.push("qr_donasi = ?"); values.push(data.qr_donasi); }

        if (fields.length === 0) return null;

        values.push(userId);
        const query = `UPDATE pengguna SET ${fields.join(", ")} WHERE id = ?`;
        const [result] = await this.db.execute(query, values);
        return result;
    }
}

module.exports = PenggunaModel;