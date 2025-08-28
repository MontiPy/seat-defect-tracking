// add_defect_type_id_to_defects.js
exports.up = function (knex) {
  return knex.schema.table('defects', function (table) {
    table
      .integer('defect_type_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('defect_types')
      .onDelete('RESTRICT');
    table.dropColumn('noted_by');
  });
};
exports.down = function (knex) {
  return knex.schema.table('defects', function (table) {
    table.dropColumn('defect_type_id');
    table.string('noted_by');
  });
};
