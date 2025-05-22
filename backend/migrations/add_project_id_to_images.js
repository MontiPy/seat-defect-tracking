// add_project_id_to_images.js
exports.up = function(knex) {
    return knex.schema.table('images', function(table) {
      table.integer('project_id').references('id').inTable('projects');
    });
  };
  exports.down = function(knex) {
    return knex.schema.table('images', function(table) {
      table.dropColumn('project_id');
    });
  };