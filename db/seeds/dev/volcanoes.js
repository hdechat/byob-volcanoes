const geoData = require('../../../data/geological-info.js')
const volcanoesData = require('../../../data/volcanoes-data.js')

exports.seed = function(knex, Promise) {
  return knex('volcanoes').del()
  .then(() => {
    return knex('geological_info').del()
  })
  .then(() => {
    return knex('geological_info').insert(geoData)
  })
  .then(() => {
    let volcanoPromises = []
    volcanoesData.forEach((volcano) => {
      let geoInfo = volcano.geo_info
      volcanoPromises.push(createVolcano(knex, volcano, geoInfo))
    })
    return Promise.all(volcanoPromises)
  })
}