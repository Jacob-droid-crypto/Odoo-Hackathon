const app = require('./app');
const env = require('./config/env');
const { connectDb, disconnectDb } = require('./config/db');
const logger = require('./utils/logger');

const startServer = async () => {
  // Attempt PostgreSQL Database connection via Prisma
  await connectDb();

  const server = app.listen(env.PORT, () => {
    logger.info('====================================================');
    logger.info(`Brightloop Subscription Management Backend is RUNNING`);
    logger.info(`Port: http://localhost:${env.PORT}`);
    logger.info(`API Base: http://localhost:${env.PORT}/api`);
    logger.info(`Health: http://localhost:${env.PORT}/api/health`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info('====================================================');
  });

  // Graceful shutdown handlers
  const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDb();
      logger.info('Database connection closed. Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
