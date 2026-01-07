const DonasiModel = require('../models/DonasiModel');
const fs = require('fs').promises;
const path = require('path');

class DonasiController {
    constructor(db) {
        this.donasiModel = new DonasiModel(db);
    }

    // Ambil daftar shelter
    async listShelters(request, reply) {
        try {
            const data = await this.donasiModel.getShelters();
            return reply.send({ success: true, data });
        } catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }

    // Submit Donasi & Upload Bukti
    async submitDonasi(request, reply) {
        try {
            const parts = request.body;
            
            const getValue = (field) => {
                if (!field) return null;
                return field.value !== undefined ? field.value : field;
            };

            const file = parts.bukti; // Kunci dari frontend harus 'bukti'
            if (!file || !file.filename) {
                return reply.status(400).send({ success: false, message: "Bukti transfer wajib diunggah" });
            }

            // Proses simpan file
            const filename = `bukti-${Date.now()}-${file.filename}`;
            const uploadDir = path.join(__dirname, '../../uploads/donasi');
            const savePath = path.join(uploadDir, filename);

            // Buat folder jika belum ada
            try { await fs.access(uploadDir); } catch { await fs.mkdir(uploadDir, { recursive: true }); }

            const buffer = typeof file.toBuffer === 'function' ? await file.toBuffer() : file._buf;
            await fs.writeFile(savePath, buffer);

            const dataDonasi = {
                donatur_id: getValue(parts.donatur_id),
                shelter_id: getValue(parts.shelter_id),
                nominal: getValue(parts.nominal),
                keterangan: getValue(parts.keterangan),
                bukti_transfer: `/uploads/donasi/${filename}`
            };

            await this.donasiModel.createDonasi(dataDonasi);

            return reply.status(201).send({ 
                success: true, 
                message: "Donasi berhasil dikirim, menunggu verifikasi shelter." 
            });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ success: false, message: error.message });
        }
    }

    async getHistory(request, reply) {
        try {
            const { userId } = request.params;
            const data = await this.donasiModel.getByDonatur(userId);
            return reply.send({ success: true, data });
        } catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }

    async updateStatus(request, reply) {
        try {
            const { id } = request.params;
            const { status } = request.body; // 'verified' atau 'rejected'
            await this.donasiModel.updateStatus(id, status);
            return reply.send({ success: true, message: `Donasi telah di-${status}` });
        } catch (error) {
            return reply.status(500).send({ success: false, message: error.message });
        }
    }
}

module.exports = DonasiController;