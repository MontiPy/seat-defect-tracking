// add_project_id_to_images.js
exports.up = function(knex) {
    return knex.schema.table('images', function(table) {
      table.integer('part_id').references('id').inTable('parts');
    });
  };
  exports.down = function(knex) {
    return knex.schema.table('images', function(table) {
      table.dropColumn('part_id');
    });
  };