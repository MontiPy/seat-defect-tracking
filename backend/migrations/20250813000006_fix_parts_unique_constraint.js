/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`
    CREATE TABLE parts_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seat_part_number TEXT NOT NULL,
      description TEXT,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      UNIQUE(seat_part_number, project_id)
    );

    INSERT INTO parts_new (id, seat_part_number, description, project_id)
    SELECT id, seat_part_number, description, project_id FROM parts;

    DROP TABLE parts;
    
    ALTER TABLE parts_new RENAME TO parts;
    
    CREATE INDEX idx_parts_project_id ON parts(project_id);
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.raw(`
    CREATE TABLE parts_old (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seat_part_number TEXT NOT NULL UNIQUE,
      description TEXT,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE
    );

    INSERT INTO parts_old (id, seat_part_number, description, project_id)
    SELECT id, seat_part_number, description, project_id FROM parts;

    DROP TABLE parts;
    
    ALTER TABLE parts_old RENAME TO parts;
    
    CREATE INDEX idx_parts_project_id ON parts(project_id);
  `);
};
