exports.seed = async function(knex) {
    await knex('zones').del();
    // Example: image 1 has two rectangular zones
    await knex('zones').insert([
      {
        id: 1,
        image_id: 1,
        name: 'Front Panel',
        polygon_coords: JSON.stringify([
          {x:10,y:10},{x:200,y:10},{x:200,y:150},{x:10,y:150}
        ])
      },
      {
        id: 2,
        image_id: 1,
        name: 'Side Panel',
        polygon_coords: JSON.stringify([
          {x:220,y:10},{x:380,y:10},{x:380,y:150},{x:220,y:150}
        ])
      },
      // … more for other images
    ]);
  };
  