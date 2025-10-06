// knexfile.js

require('dotenv').config();
const path = require('path');

// Get database path from environment (set by Electron) or use default
const getDatabasePath = () => {
  if (process.env.SQLITE_DATABASE_PATH) {
    return process.env.SQLITE_DATABASE_PATH;
  }
  return './dev.sqlite3';
};

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: getDatabasePath(),
    },
    useNullAsDefault: true, // required for sqlite3
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: getDatabasePath(),
    },
    useNullAsDefault: true, // required for sqlite3
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
};
