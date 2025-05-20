/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("build_events", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.date("date").notNullable();
    // any other metadata columns you need…
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("build_events");
};
