const shelterModel = require('../models/shelterModel');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

const handleAjukanShelter = async (request, reply) => {
  const db = request.server.db;
  
  try {
    // Karena kamu pakai attachFieldsToBody: true, data ada di request.body
    const data = request.body;

    // 1. Ambil File
    const fotoFile = data.berkas_foto; // Ini adalah objek file dari multipart
    if (!fotoFile || !fotoFile.file) {
      return reply.status(400).send({ success: false, message: "Foto wajib diunggah" });
    }

    const fileName = `${Date.now()}_${fotoFile.filename}`;
    const savePath = path.join(__dirname, '../../uploads/berkas/', fileName);

    // Pastikan folder ada
    if (!fs.existsSync(path.dirname(savePath))) {
      fs.mkdirSync(path.dirname(savePath), { recursive: true });
    }

    // Simpan file ke folder uploads
    await pump(fotoFile.file, fs.createWriteStream(savePath));

    // 2. Ambil data teks (Fastify multipart menyimpan nilai teks di .value)
    const payload = {
      pengguna_id: data.pengguna_id?.value,
      nama_shelter: data.nama_shelter?.value,
      penanggung_jawab: data.penanggung_jawab?.value,
      nik: data.nik?.value,
      whatsapp: data.whatsapp?.value,
      alamat: data.alamat?.value,
      berkas_foto: fileName
    };

    console.log("Payload yang akan disimpan:", payload);

    // 3. Simpan ke Database melalui Model
    await shelterModel.createPengajuan(db, payload);

    return { success: true, message: 'Pendaftaran mitra berhasil dikirim!' };

  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ success: false, message: err.message });
  }
};

module.exports = {handleAjukanShelter };