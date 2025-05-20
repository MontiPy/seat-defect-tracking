// knexfile.js

require("dotenv").config();

module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./dev.sqlite3", // your single-file database
    },
    useNullAsDefault: true, // required for sqlite3
    migrations: {
      directory: "./migrations",
    },
    seeds: {
      directory: "./seeds",
    },
  },

  
};
