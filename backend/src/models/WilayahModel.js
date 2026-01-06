class WilayahModel {
    constructor(db) {
      this.db = db;
    }
  
    async getProvinsi() {
      const [rows] = await this.db.execute('SELECT * FROM provinsi ORDER BY nama_provinsi ASC');
      return rows;
    }
  
    async getKabupatenKota(provinsiId) {
      const [rows] = await this.db.execute(
        'SELECT * FROM kabupaten_kota WHERE provinsi_id = ? ORDER BY nama_kabupaten_kota ASC', 
        [provinsiId]
      );
      return rows;
    }
  
    async getKecamatan(kotaId) {
      const [rows] = await this.db.execute(
        'SELECT * FROM kecamatan WHERE kabupaten_kota_id = ? ORDER BY nama_kecamatan ASC', 
        [kotaId]
      );
      return rows;
    }
  }
  
  module.exports = WilayahModel;