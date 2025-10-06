const Joi = require('joi');
const path = require('path');

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(4001), // Changed default port to avoid conflicts
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  DB_CLIENT: Joi.string().default('sqlite3'),
  DB_FILENAME: Joi.string().default('./dev.sqlite3'),
  MAX_FILE_SIZE: Joi.number().default(10485760), // 10MB
  ALLOWED_FILE_TYPES: Joi.string().default('jpg,jpeg,png,gif'),
  ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),
  // Electron-specific paths
  SQLITE_DATABASE_PATH: Joi.string().optional(),
  UPLOADS_PATH: Joi.string().optional(),
  LOGS_PATH: Joi.string().optional(),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Helper function to determine if running in Electron
const isElectron = process.versions && process.versions.electron;

// Configure paths based on environment
const getDatabasePath = () => {
  if (envVars.SQLITE_DATABASE_PATH) {
    return envVars.SQLITE_DATABASE_PATH;
  }
  return envVars.DB_FILENAME;
};

const getUploadsPath = () => {
  if (envVars.UPLOADS_PATH) {
    return envVars.UPLOADS_PATH;
  }
  return path.resolve(__dirname, '../../uploads');
};

const getLogsPath = () => {
  if (envVars.LOGS_PATH) {
    return envVars.LOGS_PATH;
  }
  return path.resolve(__dirname, '../../logs');
};

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  logLevel: envVars.LOG_LEVEL,
  isElectron,
  db: {
    client: envVars.DB_CLIENT,
    filename: getDatabasePath(),
  },
  upload: {
    maxFileSize: envVars.MAX_FILE_SIZE,
    allowedTypes: envVars.ALLOWED_FILE_TYPES.split(','),
    path: getUploadsPath(),
  },
  cors: {
    origins: envVars.ALLOWED_ORIGINS.split(','),
  },
  paths: {
    database: getDatabasePath(),
    uploads: getUploadsPath(),
    logs: getLogsPath(),
  },
};
