// backend/seeds/01_images.js
exports.seed = async function(knex) {
    // wipe out old entries
    await knex('images').del();
    // insert your references
    await knex('images').insert([
      { id: 1, filename: 'Front.jpg', url: '/uploads/Front.jpg' },
      { id: 2, filename: 'Back.jpg', url: '/uploads/Back.jpg' },
      { id: 3, filename: 'Right.jpg', url: '/uploads/Right.jpg' },
    ]);
  };
  