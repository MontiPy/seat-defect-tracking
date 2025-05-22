// backend/migrations/20250522_create_projects.js

exports.up = function(knex) {
    return knex.schema.createTable('projects', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.text('description');
    //   table.date('start_date');
    //   table.date('end_date');
    //   table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('projects');
  };
  