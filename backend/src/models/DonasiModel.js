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

    async getShelterDetail(shelterId) {
        // 1. Ambil info dasar shelter
        const [profile] = await this.db.execute(
            "SELECT id, username, foto_profil, deskripsi_shelter FROM pengguna WHERE id = ?",
            [shelterId]
        );
    
        // 2. Hitung Total Rescue yang Selesai oleh shelter ini
        const [rescueStats] = await this.db.execute(
            "SELECT COUNT(*) as total FROM laporan_rescue WHERE shelter_id = ? AND status = 'selesai'",
            [shelterId]
        );
    
        // 3. Hitung Total Kucing yang Berhasil Diadopsi dari shelter ini
        // (Asumsi: kucing tersebut milik shelter dan status aplikasi adopsinya 'disetujui')
        const [adoptStats] = await this.db.execute(
            `SELECT COUNT(*) as total 
             FROM aplikasi_adopsi aa
             JOIN kucing k ON aa.kucing_id = k.id
             WHERE k.shelter_id = ? AND aa.status = 'disetujui'`,
            [shelterId]
        );
    
        return {
            ...profile[0],
            stats: {
                rescue_count: rescueStats[0].total || 0,
                adopt_count: adoptStats[0].total || 0
            }
        };
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