// backend/seeds/01_defect_types.js
exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('defect_types').del();
  
    // Inserts sample build events
    await knex('defect_types').insert([
          { id: 1, name: 'Scratch', description: 'Surface scratch' },
          { id: 2, name: 'Tear', description: 'Material tear' },
          { id: 3, name: 'Stain', description: 'Visible stain' },
          { id: 4, name: 'Cut', description: 'Cut in material' },
          { id: 5, name: 'Burn', description: 'Burn mark' },
        ]);
      };