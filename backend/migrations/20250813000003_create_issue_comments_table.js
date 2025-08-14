/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('issue_comments', (table) => {
    table.increments('id').primary();

    // Issue relationship
    table
      .integer('issue_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('issues')
      .onDelete('CASCADE');

    // Comment details
    table.text('comment_text').notNullable();
    table.string('commented_by').notNullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Index for issue queries and chronological ordering
    table.index(['issue_id', 'created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('issue_comments');
};
