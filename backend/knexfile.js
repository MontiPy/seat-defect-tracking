// knexfile.js

require('dotenv').config();  

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host     : process.env.DB_HOST     || '127.0.0.1',
      port     : process.env.DB_PORT     || 5432,
      user     : process.env.DB_USER     || 'your_db_user',
      password : process.env.DB_PASSWORD || 'your_db_password',
      database : process.env.DB_NAME     || 'your_dev_db'
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './src/db/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './src/db/seeds'
    }
  },

  test: {
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL || {
      host     : process.env.TEST_DB_HOST     || '127.0.0.1',
      port     : process.env.TEST_DB_PORT     || 5432,
      user     : process.env.TEST_DB_USER     || 'your_test_user',
      password : process.env.TEST_DB_PASSWORD || 'your_test_password',
      database : process.env.TEST_DB_NAME     || 'your_test_db'
    },
    pool: { min: 1, max: 5 },
    migrations: {
      directory: './src/db/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './src/db/seeds_test'
    }
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,  // e.g. Heroku’s DATABASE_URL
    pool: { min: 2, max: 20 },
    migrations: {
      directory: './src/db/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './src/db/seeds_prod'
    }
  }
};
