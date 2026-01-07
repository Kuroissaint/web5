class DonasiModel {
    constructor(db) {
        this.db = db;
    }

    // Ambil daftar user yang merupakan shelter
    async getShelters() {
        const [rows] = await this.db.execute(
            "SELECT id, username, email, foto_profil FROM pengguna WHERE status = 'shelter'"
        );
        return rows;
    }

    // Simpan data donasi baru
    async createDonasi(data) {
        const query = `INSERT INTO donasi (donatur_id, shelter_id, nominal, bukti_transfer, keterangan, status) 
                       VALUES (?, ?, ?, ?, ?, 'pending')`;
        const [result] = await this.db.execute(query, [
            data.donatur_id,
            data.shelter_id,
            data.nominal,
            data.bukti_transfer,
            data.keterangan
        ]);
        return result;
    }

    // History donasi untuk user (Donatur)
    async getByDonatur(userId) {
        const query = `
            SELECT d.*, p.username as nama_shelter 
            FROM donasi d
            JOIN pengguna p ON d.shelter_id = p.id
            WHERE d.donatur_id = ?
            ORDER BY d.created_at DESC`;
        const [rows] = await this.db.execute(query, [userId]);
        return rows;
    }

    // Daftar donasi masuk untuk Shelter
    async getByShelter(shelterId) {
        const query = `
            SELECT d.*, p.username as nama_donatur 
            FROM donasi d
            JOIN pengguna p ON d.donatur_id = p.id
            WHERE d.shelter_id = ?
            ORDER BY d.created_at DESC`;
        const [rows] = await this.db.execute(query, [shelterId]);
        return rows;
    }

    // Update status donasi (Verifikasi)
    async updateStatus(id, status) {
        const query = "UPDATE donasi SET status = ? WHERE id = ?";
        const [result] = await this.db.execute(query, [status, id]);
        return result;
    }
}

module.exports = DonasiModel;