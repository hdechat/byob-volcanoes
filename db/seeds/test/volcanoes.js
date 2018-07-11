
exports.seed = function(knex, Promise) {
  return knex('volcanoes').del()
    .then(() => knex('geological_info').del())
    .then(() => {
      return Promise.all([
        knex('geological_info').insert({
          volcano_type: 'cone', rock_type: 'basalt', tectonic: 'rift zone'
        }, 'id')
        .then(geoInfo => {
          return knex('volcanoes').insert([
            {
              country: 'Italy',
              name: 'Vesuvius',
              last_known_eruption: '1944 CE',
              geological_info_id: geoInfo[0]
            },
            {
              country: 'Germany',
              name: 'Maar',
              last_known_eruption: '4040 CE',
              geological_info_id: geoInfo[0]
            },
            {
              country: 'Greece',
              name: 'Santorini',
              last_known_eruption: '1950 CE',
              geological_info_id: geoInfo[0]
            }
          ])
        })
        .then(() => console.log('Seeding complete!'))
        .catch(error => console.log(`Error seeding data: ${error}`))
      ])
    })
    .catch(error => console.log(`Error seeding data: ${error}`));
};
