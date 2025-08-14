/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('defects', (table) => {
    table
      .decimal('iqs_score', 3, 1)
      .nullable()
      .comment('IQS Quality Score (4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0)');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('defects', (table) => {
    table.dropColumn('iqs_score');
  });
};
