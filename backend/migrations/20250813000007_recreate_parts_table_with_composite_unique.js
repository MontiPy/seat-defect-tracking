/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // Step 1: Create backup table
  return knex.schema
    .createTable('parts_backup', (table) => {
      table.increments('id').primary();
      table.string('seat_part_number').notNullable();
      table.string('description').nullable();
      table
        .integer('project_id')
        .unsigned()
        .references('id')
        .inTable('projects')
        .onDelete('CASCADE');
    })
    .then(() => {
      // Step 2: Copy data to backup
      return knex('parts_backup').insert(
        knex
          .select('id', 'seat_part_number', 'description', 'project_id')
          .from('parts')
      );
    })
    .then(() => {
      // Step 3: Drop original parts table
      return knex.schema.dropTable('parts');
    })
    .then(() => {
      // Step 4: Create new parts table with composite unique constraint
      return knex.schema.createTable('parts', (table) => {
        table.increments('id').primary();
        table.string('seat_part_number').notNullable();
        table.string('description').nullable();
        table
          .integer('project_id')
          .unsigned()
          .references('id')
          .inTable('projects')
          .onDelete('CASCADE');

        // Composite unique constraint: same part number can exist for different projects
        table.unique(['seat_part_number', 'project_id']);
        table.index('project_id');
      });
    })
    .then(() => {
      // Step 5: Copy data back
      return knex('parts').insert(
        knex
          .select('id', 'seat_part_number', 'description', 'project_id')
          .from('parts_backup')
      );
    })
    .then(() => {
      // Step 6: Drop backup table
      return knex.schema.dropTable('parts_backup');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // Revert to original structure (global unique constraint)
  return knex.schema
    .createTable('parts_backup', (table) => {
      table.increments('id').primary();
      table.string('seat_part_number').notNullable().unique();
      table.string('description').nullable();
      table
        .integer('project_id')
        .unsigned()
        .references('id')
        .inTable('projects')
        .onDelete('CASCADE');
    })
    .then(() => {
      return knex('parts_backup').insert(
        knex
          .select('id', 'seat_part_number', 'description', 'project_id')
          .from('parts')
      );
    })
    .then(() => {
      return knex.schema.dropTable('parts');
    })
    .then(() => {
      return knex.schema.renameTable('parts_backup', 'parts');
    });
};
