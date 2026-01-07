// src/models/shelterModel.js
const createPengajuan = async (db, data) => {
    const { pengguna_id, nama_shelter, penanggung_jawab, nik, whatsapp, alamat, berkas_foto } = data;
    
    const sql = `INSERT INTO pengajuan_shelter 
                 (pengguna_id, nama_shelter, penanggung_jawab, nik, whatsapp, alamat, berkas_foto) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    // Karena kamu pakai mysql2/promise, gunakan .execute atau .query
    const [result] = await db.query(sql, [
      pengguna_id, nama_shelter, penanggung_jawab, nik, whatsapp, alamat, berkas_foto
    ]);
    
    return result;
  };
  
  module.exports = { createPengajuan };