// backend/src/controllers/AuthController.js
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const SALT_ROUNDS = 10;

class AuthController {
    constructor(db) {
        this.db = db;
    }

    // --- FUNGSI LOGIN ---
    async login(request, reply) {
        const { email, password } = request.body;
        try {
            const [users] = await this.db.query(
                'SELECT id, username, email, password_hash, foto_profil, provinsi_id FROM pengguna WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return reply.status(401).send({ success: false, message: 'Email tidak ditemukan.' });
            }

            const user = users[0];
            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (!isMatch) {
                return reply.status(401).send({ success: false, message: 'Password salah.' });
            }

            const token = request.server.jwt.sign({ id: user.id, email: user.email, username: user.username });
            delete user.password_hash; 

            return reply.send({ success: true, message: 'Login berhasil.', data: { token, user } });
        } catch (error) {
            return reply.status(500).send({ success: false, message: 'Terjadi kesalahan pada server.' });
        }
    }

    // --- FUNGSI REGISTER ---
    async register(request, reply) {
        const { fullName, email, password, provinsiId } = request.body; 
        if (!fullName || !email || !password) {
            return reply.code(400).send({ success: false, message: 'Nama Lengkap, Email, dan Password harus diisi.' });
        }

        try {
            const [existingUser] = await this.db.query('SELECT id FROM pengguna WHERE email = ?', [email]);
            if (existingUser.length > 0) {
                return reply.code(409).send({ success: false, message: 'Email ini sudah terdaftar.' });
            }

            const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
            const cleanName = fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const username = cleanName.substring(0, 10) + Math.floor(1000 + Math.random() * 9000);

            const insertQuery = `INSERT INTO pengguna (username, email, password_hash, provinsi_id) VALUES (?, ?, ?, ?)`;
            const [result] = await this.db.query(insertQuery, [username, email, passwordHash, provinsiId || null]); 

            reply.code(201).send({ success: true, message: 'Registrasi berhasil. Silakan login.', userId: result.insertId });
        } catch (error) {
            reply.code(500).send({ success: false, message: 'Terjadi kesalahan server: ' + error.message });
        }
    }

    // --- FUNGSI UPDATE PROFILE (YANG TADI ERROR) ---
    async updateProfile(request, reply) {
        try {
            const parts = request.body;
            const getValue = (field) => (field && field.value !== undefined ? field.value : field);
            const userId = getValue(parts.id);

            let fotoPath = getValue(parts.existing_foto);

            if (parts.foto && parts.foto.filename) {
                const file = parts.foto;
                const filename = `profile-${Date.now()}-${file.filename}`;
                const uploadDir = path.join(__dirname, '../../uploads/profile');
                const savePath = path.join(uploadDir, filename);

                try { await fs.access(uploadDir); } catch { await fs.mkdir(uploadDir, { recursive: true }); }

                const buffer = typeof file.toBuffer === 'function' ? await file.toBuffer() : file._buf;
                await fs.writeFile(savePath, buffer);
                fotoPath = `/uploads/profile/${filename}`;
            }

            const query = `UPDATE pengguna SET nama = ?, no_hp = ?, alamat = ?, foto_profil = ? WHERE id = ?`;
            await this.db.execute(query, [
                getValue(parts.nama),
                getValue(parts.no_hp),
                getValue(parts.alamat),
                fotoPath,
                userId
            ]);

            const [updated] = await this.db.query('SELECT id, username, nama, email, foto_profil as foto, no_hp, alamat FROM pengguna WHERE id = ?', [userId]);
            return reply.send({ success: true, message: "Profil berhasil diperbarui", user: updated[0] });
        } catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }
}

module.exports = AuthController;