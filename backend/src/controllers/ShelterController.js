const shelterModel = require('../models/ShelterModel');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

const handleAjukanShelter = async (request, reply) => {
    const db = request.server.db;
    
    try {
      const data = request.body;
      const fotoFile = data.berkas_foto; 
  
      if (!fotoFile || !fotoFile.file) {
        return reply.status(400).send({ success: false, message: "Foto wajib diunggah" });
      }
  
      // 1. Proses Buffer Gambar (Cara ini lebih aman untuk mencegah file korup)
      const buffer = await fotoFile.toBuffer(); // Mengambil data biner gambar secara utuh
      const fileName = `${Date.now()}_${fotoFile.filename.replace(/\s+/g, '_')}`; // Bersihkan spasi
      const uploadDir = path.join(__dirname, '../../uploads/berkas/');
      const savePath = path.join(uploadDir, fileName);
  
      // Pastikan folder ada (Gunakan versi async)
      try { 
        await fs.access(uploadDir); 
      } catch { 
        await fs.mkdir(uploadDir, { recursive: true }); 
      }
  
      // Tulis file secara utuh
      await fs.writeFile(savePath, buffer);
  
      // 2. Ambil data teks
      const payload = {
        pengguna_id: data.pengguna_id?.value || data.pengguna_id,
        nama_shelter: data.nama_shelter?.value || data.nama_shelter,
        penanggung_jawab: data.penanggung_jawab?.value || data.penanggung_jawab,
        nik: data.nik?.value || data.nik,
        whatsapp: data.whatsapp?.value || data.whatsapp,
        alamat: data.alamat?.value || data.alamat,
        berkas_foto: fileName
      };
  
      // 3. Simpan ke Database
      await shelterModel.createPengajuan(db, payload);
  
      return { success: true, message: 'Pendaftaran mitra berhasil dikirim!' };
  
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ success: false, message: err.message });
    }
  };

module.exports = {handleAjukanShelter };