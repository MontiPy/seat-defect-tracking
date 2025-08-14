/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('issue_attachments', (table) => {
    table.increments('id').primary();

    // Issue relationship
    table
      .integer('issue_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('issues')
      .onDelete('CASCADE');

    // File details
    table.string('filename').notNullable();
    table.string('file_path').notNullable();
    table.string('file_type').notNullable();
    table.integer('file_size').unsigned();
    table.string('uploaded_by').notNullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Index for issue queries
    table.index('issue_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('issue_attachments');
};
