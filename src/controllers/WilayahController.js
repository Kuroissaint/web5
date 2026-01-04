const WilayahModel = require('../models/WilayahModel');

class WilayahController {
  constructor(db) {
    this.wilayahModel = new WilayahModel(db);
  }

  async getWilayah(request, reply) {
    try {
      const { type, id } = request.params; 
      
      let data = [];
      if (type === 'provinsi') {
        data = await this.wilayahModel.getProvinsi();
      } else if (type === 'kota') {
        data = await this.wilayahModel.getKabupatenKota(id);
      } else if (type === 'kecamatan') {
        data = await this.wilayahModel.getKecamatan(id);
      }

      return reply.send({ success: true, data });
    } catch (error) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  }
}

module.exports = WilayahController;