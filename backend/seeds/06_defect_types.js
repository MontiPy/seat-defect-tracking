// backend/seeds/01_defect_types.js
exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('defect_types').del();
  
    // Inserts sample build events
    await knex('defect_types').insert([
          { id: 1, name: 'Small Wrinkle', description: 'Wrinkle that is not full panel' },
          { id: 2, name: 'Large Wrinkle', description: 'Wrinkle that is full panel' },
          { id: 3, name: 'Cross-panel Wrinkle', description: 'Wrinkle that is crosses panels' },
          { id: 4, name: 'Foreign Material', description: 'Foreign material' },
          { id: 5, name: 'Stain', description: 'Visible stain' },
          { id: 6, name: 'Uneven Thread/Piping', description: 'Thread/Piping uneven' },
          { id: 7, name: 'Stripe Not Centered', description: 'Center Stripe visibly not centered' },
          { id: 8, name: 'Rough Leather', description: 'Grandfathered material' },
          { id: 9, name: 'Visible/Stray Thread', description: 'extra thread or thread visible that shouldnt be' },
          { id: 10, name: 'Seam Stretching', description: 'Seam appears to be pulling apart' },
        ]);
      };