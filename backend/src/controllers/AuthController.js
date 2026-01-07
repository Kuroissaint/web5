// backend/src/controllers/AuthController.js
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// Fungsi Login
const login = async (request, reply) => {
    const { email, password } = request.body;
    const db = request.server.db; 

    try {
        const [users] = await db.query(
            'SELECT id, username, email, password_hash, foto_profil, provinsi_id FROM pengguna WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return reply.status(401).send({
                success: false,
                message: 'Email tidak ditemukan.'
            });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return reply.status(401).send({
                success: false,
                message: 'Password salah.'
            });
        }

        const token = request.server.jwt.sign({
            id: user.id,
            email: user.email,
            username: user.username
        });

        delete user.password_hash; 

        return reply.send({
            success: true,
            message: 'Login berhasil.',
            data: {
                token,
                user
            }
        });

    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            success: false,
            message: 'Terjadi kesalahan pada server.'
        });
    }
};

// Fungsi Register (YANG KITA PERBAIKI)
const register = async (request, reply) => {
    const { fullName, email, password, provinsiId } = request.body; 
    const db = request.server.db;

    if (!fullName || !email || !password) {
        return reply.code(400).send({
            success: false,
            message: 'Nama Lengkap, Email, dan Password harus diisi.'
        });
    }

    try {
        // 1. Cek email duplikat
        const [existingUser] = await db.query('SELECT id FROM pengguna WHERE email = ?', [email]);
        
        if (existingUser.length > 0) {
            return reply.code(409).send({ 
                success: false,
                message: 'Email ini sudah terdaftar.'
            });
        }

        // 2. Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // 3. Generate Username Unik (dari Nama Depan + Angka Acak)
        // Contoh: "Athar Ghaisan" -> "athar123"
        const cleanName = fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const username = cleanName.substring(0, 10) + Math.floor(1000 + Math.random() * 9000);

        // 4. Simpan ke Database (VERSI BENAR)
        // Kita hapus kolom 'role' karena tidak ada di DB, dan masukkan 'provinsi_id'
        const insertQuery = `
            INSERT INTO pengguna (username, email, password_hash, provinsi_id)
            VALUES (?, ?, ?, ?)
        `;
        
        const [result] = await db.query(insertQuery, [username, email, passwordHash, provinsiId || null]); 

        // 5. Respons Sukses
        reply.code(201).send({
            success: true,
            message: 'Registrasi berhasil. Silakan login.',
            userId: result.insertId
        });

    } catch (error) {
        request.log.error('Registration Error:', error);
        reply.code(500).send({
            success: false,
            message: 'Terjadi kesalahan server saat mendaftar: ' + error.message
        });
    }
};

async updateProfile(request, reply) {
    try {
        const parts = request.body;
        const userId = parts.id.value; // Pastikan kirim ID di FormData

        const getValue = (field) => (field && field.value !== undefined ? field.value : field);

        let fotoPath = getValue(parts.existing_foto); // Path lama jika tidak ganti foto

        // Jika user upload foto baru
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

        const updateData = {
            nama: getValue(parts.nama),
            no_hp: getValue(parts.no_hp),
            alamat: getValue(parts.alamat),
            foto: fotoPath
        };

        await this.penggunaModel.update(userId, updateData);
        
        // Ambil data terbaru untuk dikirim balik ke frontend
        const updatedUser = await this.penggunaModel.findById(userId);

        return reply.send({ 
            success: true, 
            message: "Profil berhasil diperbarui", 
            user: updatedUser 
        });
    } catch (error) {
        return reply.status(500).send({ success: false, message: error.message });
    }
}

module.exports = { login, register };