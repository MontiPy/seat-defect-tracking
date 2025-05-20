/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("zones", (table) => {
    table.increments("id").primary();
    table
      .integer("image_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("images")
      .onDelete("CASCADE");
    table.string("name").notNullable();
    // For Postgres use .jsonb; for SQLite .json works as text
    table.json("polygon_coords").notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("zones");
};
