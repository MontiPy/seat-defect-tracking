const knex = require('./src/db/knex'); // Adjust path as needed
const fs = require('fs');

(async () => {
  const data = await knex('defects').select('*');
  const seedContent = `
exports.seed = async function(knex) {
  await knex('defects').del();
  await knex('defects').insert(${JSON.stringify(data, null, 2)});
};
  `;
  fs.writeFileSync('./backups/defects.js', seedContent);
  process.exit();
})();
