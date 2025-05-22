// backend/seeds/01_images.js
exports.seed = async function (knex) {
  // wipe out old entries
  await knex("images").del();
  // insert your references
  await knex("images").insert([
    {
      id: 1,
      filename: "LS-Front.jpg",
      url: "/uploads/LS-Front.jpg",
      project_id: 1,
    },
    {
      id: 2,
      filename: "RS-Front.jpg",
      url: "/uploads/RS-Front.jpg",
      project_id: 1,
    },
    {
      id: 3,
      filename: "LS-Rear.jpg",
      url: "/uploads/LS-Rear.jpg",
      project_id: 1,
    },
    {
      id: 4,
      filename: "RS-Rear.jpg",
      url: "/uploads/RS-Rear.jpg",
      project_id: 1,
    },
  ]);
};
