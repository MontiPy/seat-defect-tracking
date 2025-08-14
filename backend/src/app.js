// Load .env variables from backend/.env into process.env
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');

// Import utilities and middleware
const config = require('./utils/config');
const { logger, requestLogger } = require('./utils/logger');
const { error: errorResponse } = require('./utils/response');
const { startServer } = require('./utils/server');

// Import your route modules
const imageRoutes = require('./routes/images');
const zoneRoutes = require('./routes/zones');
const defectRoutes = require('./routes/defects');
const partRoutes = require('./routes/parts');
const eventRoutes = require('./routes/buildEvents');
const projectRoutes = require('./routes/projects');
const defectTypeRoutes = require('./routes/defectTypes');
const issueRoutes = require('./routes/issues');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────

// Request logging
app.use(requestLogger);

// Enable CORS with configuration
app.use(
  cors({
    origin: config.env === 'production' ? config.cors.origins : true,
    credentials: true,
  })
);

// Parse incoming JSON bodies up to a reasonable limit
app.use(express.json({ limit: '10mb' }));

// Serve uploaded images/statics under /uploads
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// ─── Mount API Routes ───────────────────────────────────────────────────────────

// Image management (upload, retrieve file URLs, etc.)
app.use('/api/images', imageRoutes);

// Zone definitions for each image
app.use('/api/zones', zoneRoutes);

// Defect logging (create, list, filter)
app.use('/api/defects', defectRoutes);

// Parts metadata (seat part numbers)
app.use('/api/parts', partRoutes);

// Build events metadata
app.use('/api/build-events', eventRoutes);

// Projects
app.use('/api/projects', projectRoutes);

// Defect types
app.use('/api/defect-types', defectTypeRoutes);

// Issues
app.use('/api/issues', issueRoutes);

// ─── Error Handling Middleware ────────────────────────────────────────────────

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json(errorResponse('Not Found', 404));
});

// General error handler
app.use((err, req, res) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Request error', {
    requestId: req.requestId,
    error: message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(status).json(errorResponse(message, status));
});

// ─── Start Server ──────────────────────────────────────────────────────────────

// Add simple test route
app.get('/test', (req, res) => {
  res.json(errorResponse('This should be a success response', 200));
});

// Add process event handlers for debugging
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received - shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received - shutting down gracefully');
  process.exit(0);
});

// Start server with automatic port resolution
async function main() {
  try {
    logger.info('Starting server...', { preferredPort: config.port });

    const { server, port } = await startServer(app, config.port);

    // Server started successfully
    logger.info('✅ Server initialization complete', {
      port,
      environment: config.env,
      endpoints: [
        `http://localhost:${port}/api/projects`,
        `http://localhost:${port}/api/defects`,
        `http://localhost:${port}/test`,
      ],
    });

    // Graceful shutdown handling
    const gracefulShutdown = () => {
      logger.info('Received shutdown signal, closing server...');
      server.close(() => {
        logger.info('Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message });
    process.exit(1);
  }
}

// Start the application
main();
