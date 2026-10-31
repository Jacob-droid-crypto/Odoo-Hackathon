const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const env = require('./env');

let prisma;
let isDbConnected = false;

try {
  prisma = new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });
} catch (err) {
  logger.error('Failed to initialize Prisma Client:', err.message);
}

/**
 * Check and establish database connection
 */
const connectDb = async () => {
  if (!prisma) return false;
  try {
    await prisma.$connect();
    isDbConnected = true;
    logger.info(`PostgreSQL database connected successfully via Prisma ORM (${env.DATABASE_URL.split('@')[1] || 'localhost'})`);
    return true;
  } catch (error) {
    isDbConnected = false;
    logger.warn(`PostgreSQL is not reachable at ${env.DATABASE_URL}.`);
    logger.warn('Prisma ORM is configured. If PostgreSQL is running elsewhere, update DATABASE_URL in .env.');
    return false;
  }
};

const disconnectDb = async () => {
  if (prisma) {
    await prisma.$disconnect();
    isDbConnected = false;
  }
};

module.exports = {
  prisma,
  connectDb,
  disconnectDb,
  getIsDbConnected: () => isDbConnected
};
