// backend/seeds/03_build_events.js

exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('build_events').del();
  
    // Inserts sample build events
    await knex('build_events').insert([
      { id: 1, name: 'Initial Assembly', date: '2025-05-20' },
      { id: 2, name: 'Quality Inspection', date: '2025-05-22' },
      { id: 3, name: 'Final Build', date: '2025-05-25' },
      { id: 4, name: 'Post-Build Audit', date: '2025-05-27' },
    ]);
  };
  