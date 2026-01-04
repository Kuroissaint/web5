// src/models/GambarModel.js

// Ganti sintaks ES Module dengan CommonJS Class yang menerima DB connection.



class GambarModel {

  constructor(db) {

    // ⭐ Menyimpan instance koneksi DB (Fastify menggunakan db.execute dari MySQL2)

    this.db = db;

  }



  // Ganti fungsi callback db.query() menjadi Promise/async db.execute()

  async addGambar(data) {

    try {

      const { jenis_entitas, entitas_id, url_gambar, nama_file, urutan_tampil } = data;

      

      // Query SQL yang sudah kita sepakati (tanpa created_by)

     const sql = `
  INSERT INTO gambar (jenis_entitas, entitas_id, url_gambar, nama_file, urutan_tampil, created_at)
  VALUES (?, ?, ?, ?, ?, NOW())
`;

const [result] = await this.db.execute(sql, [
  jenis_entitas,  // misal: 'rescue'
  entitas_id,     // id laporan rescue
  url_gambar,
  nama_file,
  urutan_tampil
]);


      

      return result.insertId;

    } catch (error) {

      console.error("ERROR INSERT GAMBAR di GambarModel:", error);

      throw error;

    }

  }

}



module.exports = GambarModel;