// backend/seeds/02_parts.js

exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('parts').del();
  
    // Inserts sample seat parts
    await knex('parts').insert([
      { id: 1, seat_part_number: '81100', description: 'Right Front Seat' },
      { id: 2, seat_part_number: '81500', description: 'Left Front Seat' },
      { id: 3, seat_part_number: '81300', description: 'Right Mid Seat' },
      { id: 4, seat_part_number: '81700', description: 'Left Mid Seat' },
      { id: 5, seat_part_number: '81900', description: 'Center Mid Seat' },
      { id: 6, seat_part_number: '82100', description: 'Rear Seat' },
    ]);
  };
  