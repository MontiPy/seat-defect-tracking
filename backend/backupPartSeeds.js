const knex = require('./src/db/knex'); // Adjust path as needed
const fs = require('fs');

(async () => {
  const data = await knex('parts').select('*');
  const seedContent = `
exports.seed = async function(knex) {
  await knex('parts').del();
  await knex('parts').insert(${JSON.stringify(data, null, 2)});
};
  `;
  fs.writeFileSync('./backups/03_parts.js', seedContent);
  process.exit();
})();
