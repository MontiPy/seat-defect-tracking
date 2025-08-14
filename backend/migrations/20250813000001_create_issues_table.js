/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('issues', (table) => {
    table.increments('id').primary();

    // Project relationship
    table
      .integer('project_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('projects')
      .onDelete('CASCADE');

    // Issue identification
    table.string('issue_number').notNullable().unique();
    table.string('title').notNullable();
    table.text('description');

    // Issue categorization
    table
      .enum('issue_type', ['supplier', 'manufacturing', 'design', 'quality'])
      .notNullable();
    table
      .enum('severity', ['critical', 'major', 'minor', 'cosmetic'])
      .notNullable();
    table.enum('priority', ['urgent', 'high', 'medium', 'low']).notNullable();
    table
      .enum('status', ['open', 'in_progress', 'resolved', 'closed', 'rejected'])
      .defaultTo('open');

    // People involved
    table.string('assigned_to');
    table.string('reported_by').notNullable();
    table.string('supplier_name');

    // Part relationship (optional)
    table
      .integer('part_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('parts')
      .onDelete('SET NULL');

    // Resolution details
    table.text('root_cause');
    table.text('corrective_action');

    // Dates
    table.date('due_date');
    table.date('resolved_date');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes for common queries
    table.index('project_id');
    table.index('status');
    table.index('severity');
    table.index('assigned_to');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('issues');
};
