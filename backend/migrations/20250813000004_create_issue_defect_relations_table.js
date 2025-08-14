/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('issue_defect_relations', (table) => {
    table.increments('id').primary();

    // Issue relationship
    table
      .integer('issue_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('issues')
      .onDelete('CASCADE');

    // Defect relationship
    table
      .integer('defect_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('defects')
      .onDelete('CASCADE');

    // Relationship type
    table
      .enum('relationship_type', ['caused_by', 'related_to', 'resolved_by'])
      .defaultTo('related_to');

    // Metadata
    table.string('created_by').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Ensure unique combinations of issue-defect-relationship
    table.unique(['issue_id', 'defect_id', 'relationship_type']);

    // Indexes for common queries
    table.index('issue_id');
    table.index('defect_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('issue_defect_relations');
};
