
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('volcanoes', table => {
      table.dropColumn('last_eruption');
      table.string('last_known_eruption');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('volcanoes', table => {
      table.integer('last_eruption');
      table.dropColumn('last_known_eruption');
    })
  ]);
};
