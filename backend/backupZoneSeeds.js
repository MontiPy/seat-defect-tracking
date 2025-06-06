const knex = require('./src/db/knex'); // Adjust path as needed
const fs = require('fs');

(async () => {
  const data = await knex('zones').select('*');
  const seedContent = `
exports.seed = async function(knex) {
  await knex('zones').del();
  await knex('zones').insert(${JSON.stringify(data, null, 2)});
};
  `;
  fs.writeFileSync('./backups/02_zones.js', seedContent);
  process.exit();
})();
