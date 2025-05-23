// backend/seeds/03_build_events.js

exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('build_events').del();
  
    // Inserts sample build events
    await knex('build_events').insert([
      { id: 1, name: 'DAN-0', date: '2025-05-20' },
      { id: 2, name: 'DAN', date: '2025-05-22' },
      { id: 3, name: 'QC', date: '2025-05-25' },
      { id: 4, name: 'RC', date: '2025-05-27' },
    ]);
  };
  