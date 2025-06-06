// backend/seeds/02_projects.js

exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('projects').del();
  
    // Inserts sample seat projects
    await knex('projects').insert([
      { id: 1, name: 'PILOT', description: 'PILOT' },
      { id: 2, name: 'PASSPORT', description: 'PASSPORT' },
    ]);
  };
  