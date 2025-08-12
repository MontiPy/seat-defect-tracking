const net = require('net');
const { logger } = require('./logger');

/**
 * Check if a port is available
 * @param {number} port
 * @returns {Promise<boolean>}
 */
function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.listen(port, () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Find an available port starting from the given port
 * @param {number} startPort
 * @param {number} maxAttempts
 * @returns {Promise<number>}
 */
async function findAvailablePort(startPort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const isAvailable = await checkPortAvailable(port);

    if (isAvailable) {
      return port;
    }

    logger.warn(`Port ${port} is not available, trying next...`);
  }

  throw new Error(
    `Could not find an available port after ${maxAttempts} attempts starting from ${startPort}`
  );
}

/**
 * Start server with automatic port resolution
 * @param {object} app Express app instance
 * @param {number} preferredPort
 * @returns {Promise<{server, port}>}
 */
async function startServer(app, preferredPort) {
  try {
    // First try the preferred port
    const isPreferredAvailable = await checkPortAvailable(preferredPort);

    let finalPort;
    if (isPreferredAvailable) {
      finalPort = preferredPort;
      logger.info(`Using preferred port ${preferredPort}`);
    } else {
      logger.warn(
        `Preferred port ${preferredPort} is not available, finding alternative...`
      );
      finalPort = await findAvailablePort(preferredPort + 1);
      logger.info(`Using alternative port ${finalPort}`);
    }

    return new Promise((resolve, reject) => {
      const server = app.listen(finalPort, () => {
        logger.info(
          `🚀 Server successfully started on http://localhost:${finalPort}`,
          {
            port: finalPort,
            preferred: preferredPort,
            environment: process.env.NODE_ENV || 'development',
          }
        );
        resolve({ server, port: finalPort });
      });

      server.on('error', (error) => {
        logger.error('Server failed to start:', { error: error.message });
        reject(error);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message });
    throw error;
  }
}

module.exports = {
  checkPortAvailable,
  findAvailablePort,
  startServer,
};
