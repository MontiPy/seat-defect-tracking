/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("defects", (table) => {
    table.increments("id").primary();

    table
      .integer("image_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("images")
      .onDelete("CASCADE");

    table
      .integer("zone_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("zones")
      .onDelete("SET NULL");

    table.integer("x").notNullable();
    table.integer("y").notNullable();

    table.string("cbu").notNullable();

    table
      .integer("part_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("parts")
      .onDelete("RESTRICT");

    table
      .integer("build_event_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("build_events")
      .onDelete("RESTRICT");

    table.string("noted_by").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("defects");
};
