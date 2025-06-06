const knex = require('./src/db/knex'); // Adjust path as needed
const fs = require('fs');

(async () => {
  const data = await knex('defect_types').select('*');
  const seedContent = `
exports.seed = async function(knex) {
  await knex('defect_types').del();
  await knex('defect_types').insert(${JSON.stringify(data, null, 2)});
};
  `;
  fs.writeFileSync('./backups/06_defect_types.js', seedContent);
  process.exit();
})();
