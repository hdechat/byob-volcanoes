const geoData = require('../../../data/geological-info.js');
const volcanoesData = require('../../../data/volcanoes-data.js');

exports.seed = function(knex, Promise) {
  return knex('volcanoes').del()
    .then(() => {
      return knex('geological_info').del();
    })
    .then(() => {
      return knex('geological_info').insert(geoData);
    })
    .then(() => {
      let volcanoPromises = [];
      volcanoesData.forEach((volcano) => {
        let geoInfo = volcano.geo_info;
        volcanoPromises.push(createVolcano(knex, volcano, geoInfo));
      });
      return Promise.all(volcanoPromises);
    });
};

const createVolcano = (knex, volcano, geoInfo) => {
  const { volcano_type, rock_type, tectonic } = geoInfo;
  return knex('geological_info')
    .where('volcano_type', volcano_type)
    .where('rock_type', rock_type)
    .where('tectonic', tectonic).first()
    .then((geoInfoId) => {
      return knex('volcanoes').insert({
        name: volcano.name,
        country: volcano.country,
        last_known_eruption: volcano.last_known_eruption,
        geological_info_id: geoInfoId.id
      });
    });
};
