/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // First, remove duplicate parts that conflict with existing null project parts
  // Check if part 82100 exists with project_id=1 and remove it since we'll use the null one
  return knex('parts')
    .where('seat_part_number', '82100')
    .andWhere('project_id', 1)
    .del()
    .then(() => {
      // Now assign all parts with null project_id to project 1 (PILOT)
      return knex('parts').where('project_id', null).update({ project_id: 1 });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // Revert the original 6 parts back to null project_id
  return knex('parts')
    .whereIn('id', [1, 2, 3, 4, 5, 6])
    .update({ project_id: null })
    .then(() => {
      // Re-create the deleted part with project_id=1
      return knex('parts').insert({
        seat_part_number: '82100',
        description: 'Rear Seat for PILOT',
        project_id: 1,
      });
    });
};
