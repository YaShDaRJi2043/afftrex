// Import database configuration from the config file
const { database } = require("@config/config");

// Import Sequelize library for connecting to the postgres database
const Sequelize = require("sequelize");
const setupSequelizeDebug = require("@helper/sequelize-debug");
// Create a new Sequelize instance to connect to the database

const sequelize = new Sequelize(
  database.database, // The name of the database from the config
  database.username, // The database username from the config
  database.password, // The database password from the config
  {
    host: database.host, // The host of the database (default: '127.0.0.1')
    port: database.port, // The database port (default: 5432 for postgres)
    dialect: database.dialect, // The type of database (e.g., 'mysql', 'postgres', etc.)
    logging: console.log, // Enable logging of SQL queries to the console
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Required if you're not providing a CA
      },
    },
  }
);
if (process.env.NODE_ENV === "local") {
  setupSequelizeDebug(sequelize, {
    explain: process.env.DB_POSTGESQL_QUERY_EXPLAIN,
  });
}
// Authenticate the database connection to ensure it's working
sequelize
  .authenticate() // Attempt to connect to the database
  .then(() => {
    // If the connection is successful, log a success message
    console.log("Postgres DB Connection has been established successfully.");
  })
  .catch((err) => {
    // If the connection fails, log an error message with details
    console.error("Unable to connect to the database:", err);
  });

// Export the Sequelize instance so it can be used elsewhere in the application
module.exports = sequelize;
