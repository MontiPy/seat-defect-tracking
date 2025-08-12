require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Test the basic components
console.log('Testing config...');
try {
  const config = require('./src/utils/config');
  console.log('✅ Config loaded:', { port: config.port, env: config.env });
} catch (err) {
  console.error('❌ Config error:', err.message);
  process.exit(1);
}

console.log('Testing logger...');
try {
  const { logger } = require('./src/utils/logger');
  logger.info('Logger test successful');
  console.log('✅ Logger working');
} catch (err) {
  console.error('❌ Logger error:', err.message);
  process.exit(1);
}

console.log('Testing database...');
try {
  const knex = require('./src/db/knex');
  knex
    .raw('SELECT 1')
    .then(() => {
      console.log('✅ Database connection successful');

      // Test a simple server
      const app = express();
      app.use(cors());
      app.use(express.json());

      app.get('/test', (req, res) => {
        res.json({ message: 'Server is working!' });
      });

      const PORT = 4000;
      app.listen(PORT, () => {
        console.log(`✅ Test server running on port ${PORT}`);
        console.log('Test complete - server should stay running now');
      });
    })
    .catch((err) => {
      console.error('❌ Database error:', err.message);
      process.exit(1);
    });
} catch (err) {
  console.error('❌ Database connection error:', err.message);
  process.exit(1);
}
