// backend/seeds/01_images.js
exports.seed = async function (knex) {
  // wipe out old entries
  await knex("images").del();
  // insert your references
  await knex("images").insert([
    {
      id: 1,
      filename: "81500-Front.jpg",
      url: "/uploads/81500-Front.jpg",
      project_id: 1,
      part_id: 2,
    },
    {
      id: 2,
      filename: "81100-Front.jpg",
      url: "/uploads/81100-Front.jpg",
      project_id: 1,
      part_id: 1,
    },
    {
      id: 3,
      filename: "81500-Rear.jpg",
      url: "/uploads/81500-Rear.jpg",
      project_id: 1,
      part_id: 2,
    },
    {
      id: 4,
      filename: "81100-Rear.jpg",
      url: "/uploads/81100-Rear.jpg",
      project_id: 1,
      part_id: 1,
    },
    {
      id: 5,
      filename: "81300-Front.jpg",
      url: "/uploads/81300-Front.jpg",
      project_id: 1,
      part_id: 3,
    },
    {
      id: 6,
      filename: "81700-Rear.jpg",
      url: "/uploads/81700-Front.jpg",
      project_id: 1,
      part_id: 4,
    },
    {
      id: 7,
      filename: "82100-Rear.jpg",
      url: "/uploads/82100-Front.jpg",
      project_id: 1,
      part_id: 6,
    },
  ]);
};
