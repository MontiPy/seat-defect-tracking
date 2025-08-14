/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('issue_defect_relations', (table) => {
    // Drop the existing composite unique constraint
    table.dropUnique(['issue_id', 'defect_id', 'relationship_type']);

    // Add a unique constraint on defect_id only to enforce one-to-one linking
    table.unique(['defect_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('issue_defect_relations', (table) => {
    // Drop the unique constraint on defect_id
    table.dropUnique(['defect_id']);

    // Re-add the composite unique constraint
    table.unique(['issue_id', 'defect_id', 'relationship_type']);
  });
};
