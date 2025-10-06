const fs = require('fs');
const path = require('path');
const config = require('./config');
const knex = require('../db/knex');
const { logger } = require('./logger');

/**
 * Initialize the application on first run
 * This handles database setup and initial data seeding
 */
async function initializeApp() {
  try {
    logger.info('Initializing application...');

    // Ensure all necessary directories exist
    await ensureDirectories();

    // Initialize database
    await initializeDatabase();

    // Run any necessary migrations
    await runMigrations();

    logger.info('Application initialization complete');
  } catch (error) {
    logger.error('Application initialization failed:', error);
    throw error;
  }
}

/**
 * Ensure all necessary directories exist
 */
async function ensureDirectories() {
  const directories = [
    config.paths.uploads,
    config.paths.logs,
    path.join(config.paths.uploads, 'defects'),
    path.join(config.paths.uploads, 'reference-images'),
    path.dirname(config.paths.database),
  ];

  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  }
}

/**
 * Initialize database if it doesn't exist
 */
async function initializeDatabase() {
  try {
    // Test database connection
    await knex.raw('SELECT 1');
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

/**
 * Run database migrations
 */
async function runMigrations() {
  try {
    logger.info('Running database migrations...');
    await knex.migrate.latest();
    logger.info('Database migrations completed');
  } catch (error) {
    logger.error('Database migration failed:', error);
    throw error;
  }
}

/**
 * Check if this is the first run of the application
 */
function isFirstRun() {
  const databasePath = config.paths.database;
  return !fs.existsSync(databasePath);
}

/**
 * Seed database with initial data (optional, for first run)
 */
async function seedDatabase() {
  try {
    if (isFirstRun()) {
      logger.info('First run detected, seeding database...');
      await knex.seed.run();
      logger.info('Database seeding completed');
    }
  } catch (error) {
    logger.warn('Database seeding failed (this is optional):', error);
  }
}

module.exports = {
  initializeApp,
  ensureDirectories,
  initializeDatabase,
  runMigrations,
  seedDatabase,
  isFirstRun,
};