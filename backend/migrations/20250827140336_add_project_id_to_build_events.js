/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('build_events', (table) => {
    table
      .integer('project_id')
      .references('id')
      .inTable('projects')
      .onDelete('CASCADE');
    table.index('project_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('build_events', (table) => {
    table.dropIndex('project_id');
    table.dropColumn('project_id');
  });
};
