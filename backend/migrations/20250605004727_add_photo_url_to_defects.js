/**
 * Add photo_url column to defects
 * @param { import('knex').Knex } knex
 */
exports.up = function(knex) {
  return knex.schema.table('defects', function(table) {
    table.string('photo_url').nullable();
  });
};

/**
 * Drop photo_url column
 * @param { import('knex').Knex } knex
 */
exports.down = function(knex) {
  return knex.schema.table('defects', function(table) {
    table.dropColumn('photo_url');
  });
};
