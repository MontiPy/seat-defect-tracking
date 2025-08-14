/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table('parts', function (table) {
    table
      .integer('project_id')
      .unsigned()
      .references('id')
      .inTable('projects')
      .onDelete('CASCADE');

    // Add index for performance on project-based queries
    table.index('project_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table('parts', function (table) {
    table.dropIndex('project_id');
    table.dropColumn('project_id');
  });
};
