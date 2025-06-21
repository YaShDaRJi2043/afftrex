// Import necessary modules
const dotenv = require("dotenv");
const path = require("path");

// Get the current environment (if not set, default to 'local')
const environment = process.env.NODE_ENV || "local";

// Define the path to the .env file based on the environment (e.g., .env.development, .env.production)
const envFilePath = path.resolve(process.cwd(), `.env.${environment}`);

// Load environment variables from the corresponding .env file
dotenv.config({ path: envFilePath });

const commonConfig = {
  database: process.env.DB_MYSQL_DATABASE || "postgres", // Database name (default: 'node_react_web_mobile_api_boilerplate')
  username: process.env.DB_MYSQL_USERNAME || "postgres", // Database username (default: 'root')
  password: process.env.DB_MYSQL_PASSWORD || "root", // Database password (default: 'root')
  host: process.env.DB_MYSQL_HOST || "127.0.0.1", // Database host (default: '127.0.0.1')
  port: process.env.DB_MYSQL_PORT || 5432, // MySQL port (default: 3306)
  dialect: process.env.DB_DIALECT || "postgres", // Database DB_DIALECT (default: 'mysql')
  dialectOptions:
    environment == "local"
      ? {}
      : {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
};

// Export the configuration object
module.exports = {
  // Local environment configuration
  local: commonConfig,

  // Development environment configuration
  development: commonConfig,

  // Test environment configuration
  test: commonConfig,

  // Production environment configuration
  production: commonConfig,

  // General database settings for the application
  database: commonConfig,

  // Server configuration (e.g., API settings)
  serverInfo: {
    port: process.env.PORT || 5000, // Port to run the server on (default: 4040)
    host_url_prefix: process.env.HOST_URL_PREFIX || "/api", // URL prefix for the API (default: 'api')
    api_url: process.env.API_URL || "http://localhost:5000", // Full API URL (default: 'http://localhost:4040')
    front_url: process.env.FRONT_APP_URL || "http://localhost:5173/",
  },

  // Secret keys used for JWT authentication and encryption
  secret: {
    JWT_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET || "AFFTREX27052025", // JWT access token secret (default: 'BOILERPLATE12032025')
    JWT_TOKEN_EXPIRY: process.env.JWT_ACCESS_TOKEN_EXPIRY || "1h", // JWT access token expiry (default: '2h')
  },

  //email service
  email: {
    emailHost: process.env.EMAILHOST,
    emailUser: process.env.EMAILUSER,
    emailPassword: process.env.EMAILPASSWORD,
    emailPort: process.env.EMAILPORT,
  },

  //AWS s3Bucket service
  s3Bucket: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION,
    bucket: process.env.AWS_BUCKET,
  },

  //redis service
  redisConfigs: {
    redisUser: process.env.REDIS_USERNAME,
    redisPassword: process.env.REDIS_PASSWORD,
    redisHost: process.env.REDIS_HOST,
  },
};
