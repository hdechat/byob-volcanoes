
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('geological_info', table => {
      table.increments('id').primary();
      table.string('volcano_type');
      table.string('rock_type');
      table.string('tectonic');

      table.timestamps(true, true);
    }),

    knex.schema.createTable('volcanoes', table => {
      table.increments('id').primary();
      table.string('name');
      table.string('country');
      table.integer('last_eruption');
      table.integer('geological_info_id').unsigned();
      table.foreign('geological_info_id')
        .references('geological_info.id');

      table.timestamps(true, true);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('volcanoes'),
    knex.schema.dropTable('geological_info')
  ]);
};
