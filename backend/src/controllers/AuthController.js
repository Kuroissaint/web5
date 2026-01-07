// backend/src/controllers/AuthController.js
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const SALT_ROUNDS = 10;
const PenggunaModel = require('../models/penggunaModel');
class AuthController {
    constructor(db) {
        this.db = db;
    }

    // --- FUNGSI LOGIN ---
    async login(request, reply) {
        const { email, password } = request.body;
        try {
            // TAMBAHKAN: status, deskripsi_shelter, dan qr_donasi ke dalam query SELECT
            const [users] = await this.db.query(
                `SELECT id, username, email, password_hash, foto_profil, 
                        provinsi_id, status, deskripsi_shelter, qr_donasi 
                 FROM pengguna WHERE email = ?`,
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
    
            // Simpan status di dalam token juga jika diperlukan untuk proteksi rute di backend
            const token = request.server.jwt.sign({ 
                id: user.id, 
                email: user.email, 
                username: user.username,
                status: user.status // Tambahkan status ke payload JWT
            });
    
            // Hapus password_hash sebelum dikirim ke frontend demi keamanan
            delete user.password_hash; 
    
            // Sekarang 'user' membawa data lengkap (status, deskripsi, qr) untuk disimpan di AsyncStorage
            return reply.send({ 
                success: true, 
                message: 'Login berhasil.', 
                data: { token, user } 
            });
    
        } catch (error) {
            request.log.error(error);
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
            const userId = request.user.id; 
            const getValue = (field) => (field && field.value !== undefined ? field.value : field);
    
            let fotoProfilPath = getValue(parts.existing_foto_profil);
            let qrDonasiPath = getValue(parts.existing_qr_donasi);
    
            // --- Logika Upload Foto Profil ---
            if (parts.foto_profil && parts.foto_profil.filename) {
                fotoProfilPath = await this.saveFile(parts.foto_profil, 'profile');
            }
    
            // --- Logika Upload QR Donasi (Khusus Shelter) ---
            if (parts.qr_donasi && parts.qr_donasi.filename) {
                qrDonasiPath = await this.saveFile(parts.qr_donasi, 'qris');
            }
    
            const penggunaModel = new PenggunaModel(this.db);
            await penggunaModel.update(userId, {
                username: getValue(parts.username),
                no_hp: getValue(parts.no_hp),
                alamat: getValue(parts.alamat),
                foto: fotoProfilPath,
                deskripsi_shelter: getValue(parts.deskripsi_shelter),
                qr_donasi: qrDonasiPath
            });
    
            const updatedUser = await penggunaModel.getById(userId);
            
            return reply.send({ 
                success: true, 
                message: "Profil berhasil diperbarui", 
                user: updatedUser 
            });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ success: false, message: error.message });
        }
    }

    // Fungsi helper untuk simpan file agar kode tidak duplikat
    async saveFile(file, folder) {
        const filename = `${folder}-${Date.now()}-${file.filename}`;
        const uploadDir = path.join(__dirname, `../../uploads/${folder}`);
        const savePath = path.join(uploadDir, filename);

        try { await fs.access(uploadDir); } catch { await fs.mkdir(uploadDir, { recursive: true }); }

        const buffer = typeof file.toBuffer === 'function' ? await file.toBuffer() : file._buf;
        await fs.writeFile(savePath, buffer);
        return `/uploads/${folder}/${filename}`;
    }

}
module.exports = AuthController;