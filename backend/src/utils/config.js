const Joi = require('joi');

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
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  logLevel: envVars.LOG_LEVEL,
  db: {
    client: envVars.DB_CLIENT,
    filename: envVars.DB_FILENAME,
  },
  upload: {
    maxFileSize: envVars.MAX_FILE_SIZE,
    allowedTypes: envVars.ALLOWED_FILE_TYPES.split(','),
  },
  cors: {
    origins: envVars.ALLOWED_ORIGINS.split(','),
  },
};
