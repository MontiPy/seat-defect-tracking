// backend/seeds/02_parts.js

exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('parts').del();
  
    // Inserts sample seat parts
    await knex('parts').insert([
      { id: 1, seat_part_number: 'SPN-001', description: 'Left Front Seat Frame' },
      { id: 2, seat_part_number: 'SPN-002', description: 'Right Front Seat Frame' },
      { id: 3, seat_part_number: 'SPN-003', description: 'Rear Seat Cushion' },
      { id: 4, seat_part_number: 'SPN-004', description: 'Headrest Assembly' },
    ]);
  };
  